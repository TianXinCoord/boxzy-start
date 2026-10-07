(() => {
 'use strict';
 const items = window.BOXZY_PRIZES || [];
 const viewport = document.getElementById('prize-viewport');
 const track = document.getElementById('prize-track');
 const announcement = document.getElementById('prize-announcement');
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 const money = new Intl.NumberFormat('en-US', {style:'currency',currency:'USD',maximumFractionDigits:0});
 const mobile=matchMedia('(max-width:834px)');
 const controls=document.querySelector('.gallery-controls'), header=document.querySelector('.prizes .section-header'), mobileNav=document.querySelector('.mobile-gallery-nav'), middleForm=document.querySelector('.compact-signup'), desktopSignupSlot=document.querySelector('[data-desktop-signup-slot]');
 const previous=document.querySelector('.previous'), next=document.querySelector('.next'), pageLabel=document.querySelector('.gallery-page');
 const order=[2,1,0,3,...items.map((_,i)=>i).slice(4)];
 const pageCount=Math.ceil(items.length/4);
 let page=0;
 let active = 2, pointer = null, dragged = false, frame = 0;
 const wrap = n => (n % items.length + items.length) % items.length;
 const cards = items.map((item,index) => {
  const card = document.createElement('article');
  card.className='prize-card'; card.dataset.index=index;
  card.setAttribute('aria-label',`${item.name}, ${item.type}. Approximate reference value ${money.format(item.value)} US dollars.`);
  const art=document.createElement('div'); art.className='prize-image-area';
  const img=document.createElement('img');img.className='prize-art';img.src=item.image;img.alt='';img.draggable=false;img.decoding='async';
  art.append(img);
  const label=document.createElement('div');label.className='prize-label';
  const name=document.createElement('h3');name.textContent=item.name;
  const type=document.createElement('p');type.textContent=item.type;
  const value=document.createElement('p');value.className='prize-value';value.textContent=money.format(item.value);
  label.append(name,type,value);card.append(art,label);track.append(card);
  return card;
 });
 const spacing = () => viewport.clientWidth * .166;
 function layout(){
  document.querySelector('.value-note').textContent='Prizes shown are examples only. Actual prizes will be confirmed at launch.';
  (mobile.matches?mobileNav:header).append(controls);
  (mobile.matches?document.querySelector('.prize-signup-slot'):desktopSignupSlot).append(middleForm);
  previous.setAttribute('aria-label',mobile.matches?'Previous prize page':'Previous prize');next.setAttribute('aria-label',mobile.matches?'Next prize page':'Next prize');
  paint();
 }
 function selectPage(n,announce=true){
  page=Math.max(0,Math.min(pageCount-1,n));paint();
  if(announce)announcement.textContent=`Prize page ${page+1} of ${pageCount}. ${order.slice(page*4,page*4+4).map(i=>items[i].name).join(', ')}.`;
 }
 function paint(distance=0){
  previous.disabled=mobile.matches&&page===0;next.disabled=mobile.matches&&page===pageCount-1;
  pageLabel.textContent=`${page+1} / ${pageCount}`;
  viewport.dataset.page=String(page+1);
  if(mobile.matches){
   cards.forEach((card,index)=>{const position=order.indexOf(index),visible=Math.floor(position/4)===page;card.hidden=!visible;card.style.order=position;card.setAttribute('aria-hidden',String(!visible));card.classList.remove('is-edge');});return;
  }
  cards.forEach(card=>{card.hidden=false;card.style.removeProperty('order');});
  cards.forEach((card,index)=>{
   let offset=index-active;
   if(offset>items.length/2) offset-=items.length;
   if(offset < -items.length/2) offset+=items.length;
   const position=offset + distance/spacing();
   const visible=Math.abs(position)<(viewport.clientWidth<=834?2.1:3.8);
   card.classList.toggle('is-edge',Math.abs(position)>(viewport.clientWidth<=834?1:2));
   card.style.setProperty('--shift',`${position*100}%`);
   card.style.setProperty('--opacity',visible?1:0);
   card.setAttribute('aria-hidden',String(!visible));
  });
 }
 function select(index,announce=true){
  active=wrap(index);viewport.dataset.active=String(items[active].id);paint();
  if(announce) announcement.textContent=`${items[active].name} ${items[active].type}, approximately ${money.format(items[active].value)} US dollars. ${active+1} of ${items.length}.`;
 }
 viewport.addEventListener('pointerdown',e=>{
  if(e.button!==0)return;
  pointer={id:e.pointerId,x:e.clientX,y:e.clientY,dx:0};dragged=false;
 });
 viewport.addEventListener('pointermove',e=>{
  if(!pointer||pointer.id!==e.pointerId)return;
  const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;
  if(!dragged&&Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>8){pointer=null;return;}
  if(Math.abs(dx)>6){
   dragged=true;pointer.dx=dx;
   if(!viewport.hasPointerCapture(e.pointerId))viewport.setPointerCapture(e.pointerId);
   viewport.classList.add('is-dragging');
   cards.forEach(card=>card.style.transition='none');
   cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>paint(pointer?pointer.dx:0));
  }
 });
 function finishDrag(e){
  if(!pointer||pointer.id!==e.pointerId)return;
  cancelAnimationFrame(frame);
  const dx=e.type==='pointercancel'?0:pointer.dx;
  pointer=null;
  viewport.classList.remove('is-dragging');cards.forEach(card=>card.style.removeProperty('transition'));
  const steps=Math.abs(dx)>30?Math.sign(dx)*Math.max(1,Math.round(Math.abs(dx)/spacing())):0;
  if(mobile.matches)selectPage(page+(Math.abs(dx)>30?(dx<0?1:-1):0),Math.abs(dx)>30);else select(active-steps,!!steps);dragged=false;
 }
 viewport.addEventListener('pointerup',finishDrag);viewport.addEventListener('pointercancel',finishDrag);viewport.addEventListener('lostpointercapture',finishDrag);
 window.addEventListener('pointerup',finishDrag);
 viewport.addEventListener('dragstart',e=>e.preventDefault());
 viewport.addEventListener('keydown',e=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
  e.preventDefault();if(mobile.matches){selectPage(e.key==='Home'?0:e.key==='End'?pageCount-1:page+(e.key==='ArrowRight'?1:-1));return;}select(e.key==='Home'?0:e.key==='End'?items.length-1:active+(e.key==='ArrowRight'?1:-1));
 });
 document.querySelector('.previous').addEventListener('click',()=>mobile.matches?selectPage(page-1):select(active-1));
 document.querySelector('.next').addEventListener('click',()=>mobile.matches?selectPage(page+1):select(active+1));
 new ResizeObserver(()=>{track.classList.remove('is-ready');paint();requestAnimationFrame(()=>requestAnimationFrame(()=>track.classList.add('is-ready')));}).observe(viewport);
 if(items.length)select(2,false);
 mobile.addEventListener('change',layout);layout();

 document.querySelector('[data-get-notified]').addEventListener('click',e=>{
  e.preventDefault();document.getElementById('top').scrollIntoView({behavior:reduced.matches?'instant':'smooth'});
  history.replaceState(null,'','#top');
  const form=document.querySelector('.hero-signup');
  (form.querySelector('.signup-confirmation:not([hidden])')||document.getElementById('hero-email')).focus({preventScroll:true});
 });
})();
