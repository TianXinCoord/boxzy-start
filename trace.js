(() => {
 'use strict';
 const config=window.BOXZY_SIGNUP||{};
 const fallback=()=>Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
 const sessionId=globalThis.crypto?.randomUUID?.()||fallback();
 const platform=new URL(location.href).searchParams.get('platform')?.trim().toLowerCase().slice(0,64)||null;
 const endpoint=config.traceEndpoint||'';
 const track=(eventName,properties={})=>{
  if(!endpoint)return;
  try{
   void fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({eventName,source:'pc',platform,sessionId,pageUrl:location.href,properties}),keepalive:true}).catch(()=>{});
  }catch{}
 };
 window.BOXZY_TRACE={sessionId,track};
 const sectionIds=new Set();
 const observer='IntersectionObserver' in window?new IntersectionObserver(entries=>entries.forEach(entry=>{
  const id=entry.target.id;
  if(entry.isIntersecting&&id&&!sectionIds.has(id)){sectionIds.add(id);track('section_view',{sectionId:id});}
 }),{threshold:.35}):null;
 document.querySelectorAll('main section[id]').forEach(section=>observer?.observe(section));
 document.addEventListener('click',event=>{
  const target=event.target.closest?.('a,button');
  if(!target)return;
  const section=target.closest('section[id]');
  const label=(target.dataset.traceEvent||target.getAttribute('aria-label')||target.textContent||'').trim().replace(/\s+/g,' ').slice(0,100);
  track('interaction_click',{target:label,sectionId:section?.id||null});
 });
 track('page_view',{page:location.pathname});
})();
