(() => {
 'use strict';
 const forms=[...document.querySelectorAll('[data-notify-form]')];
 const config=window.BOXZY_SIGNUP||{};
 const url=new URL(location.href),preview=url.searchParams.get('signup-demo');
 const local=['localhost','127.0.0.1','[::1]',''].includes(location.hostname);
 const endpoint=config.endpoint||forms.find(form=>form.dataset.endpoint)?.dataset.endpoint||'';
 const demo=local&&!endpoint;
 const key=demo?'boxzy.signup.demo.v1':'boxzy.signup.confirmed.v1';
 const lifetime=180*24*60*60*1000;
 let pending=false,demoFailed=false;
 function read(){try{const r=JSON.parse(localStorage.getItem(key));return r?.version===1&&Number.isFinite(r.at)&&r.at<=Date.now()&&Date.now()-r.at<lifetime;}catch{return false;}}
 function remember(){try{localStorage.setItem(key,JSON.stringify({version:1,at:Date.now()}));}catch{/* Storage is optional; never save the email address here. */}}
 // A forced initial state is a one-time entry. Refresh must reflect the completed flow.
 if(demo&&['before','success','returning'].includes(preview)){
  if(preview==='before'){try{localStorage.removeItem(key);}catch{}}
  else remember();
  url.searchParams.delete('signup-demo');history.replaceState(null,'',url.href);
 }
 const entries=forms.map(form=>{
  const input=form.querySelector('input[type=email]'),bar=form.querySelector('.email-bar'),note=form.querySelector('.email-note'),status=form.querySelector('.form-status'),button=form.querySelector('button[type=submit]');
  const spinner=document.createElement('span');spinner.className='signup-spinner';spinner.setAttribute('aria-hidden','true');spinner.hidden=true;button.prepend(spinner);
  const label=button.querySelector('span:not(.signup-spinner)');
  const panel=document.createElement('div');panel.className='signup-confirmation';panel.hidden=true;panel.tabIndex=-1;
  panel.innerHTML='<svg class="confirmation-icon" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="14"/><path d="m9 16 5 5 9-10"/></svg><div class="confirmation-copy"><p class="confirmation-title"></p><p class="confirmation-description"></p><button type="button" class="change-email">Use another email</button></div>';
  panel.setAttribute('role','group');form.append(panel);
  const title=panel.querySelector('.confirmation-title'),description=panel.querySelector('.confirmation-description');
  title.id=input.id+'-confirmation';description.id=input.id+'-confirmation-description';panel.setAttribute('aria-labelledby',title.id);panel.setAttribute('aria-describedby',description.id);
  const entry={form,input,bar,note,status,button,label,spinner,panel,title,description};
  panel.querySelector('.change-email').addEventListener('click',()=>{render('idle');input.focus({preventScroll:true});});
  input.addEventListener('input',()=>{
   if(pending)return;
   if(entries.some(e=>e.form.dataset.state==='error'))render('idle');
   input.removeAttribute('aria-invalid');status.hidden=true;note.hidden=false;form.dataset.state='idle';label.textContent='Notify Me';
  });
  form.addEventListener('submit',event=>submit(event,entry));return entry;
 });
 function render(state){
  const done=state==='success'||state==='returning';
  entries.forEach(e=>{
   e.form.dataset.state=state;e.bar.hidden=done;e.note.hidden=done;e.panel.hidden=!done;e.status.hidden=true;e.input.removeAttribute('aria-invalid');e.status.classList.remove('error');
   e.label.textContent=state==='submitting'?'Joining…':'Notify Me';
   if(done){e.form.reset();e.title.textContent=state==='success'?'You’re on the list!':'You’re already on the list.';e.description.textContent=state==='success'?'We’ll email you at launch.':'No need to sign up again. We’ll email you at launch.';}
  });
 }
 function busy(value){pending=value;entries.forEach(e=>{e.button.disabled=value;e.input.readOnly=value;e.spinner.hidden=!value;e.form.setAttribute('aria-busy',String(value));});}
 function message(e,text,state,announce=true){e.form.dataset.state=state;e.note.hidden=true;e.status.setAttribute('aria-live',announce?'polite':'off');e.status.textContent=text;e.status.hidden=false;e.status.classList.add('error');e.label.textContent=state==='error'?'Try again':'Notify Me';}
 async function save(email,signal){
  if(demo){
   await new Promise(resolve=>setTimeout(resolve,650));
   const result=url.searchParams.get('signup-result');
   if(result==='error'||(result==='error-once'&&!demoFailed)){demoFailed=true;throw new Error('Preview failure');}
   return{success:true,alreadySubscribed:result==='returning'};
  }
  if(!endpoint)throw new Error('Signup endpoint missing');
  const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email}),signal});
  if(!response.ok)throw new Error('Signup failed');
  const result=await response.json();if(result.success!==true)throw new Error('Signup not confirmed');return{...result,...(result.data||{})};
 }
 async function submit(event,e){
  event.preventDefault();if(pending||!e.panel.hidden)return;
  e.input.value=e.input.value.trim();
  if(!e.input.validity.valid||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.input.value)){
   e.input.setAttribute('aria-invalid','true');message(e,e.input.validity.valueMissing?'Enter your email address.':'Enter a valid email address, like you@example.com.','invalid');e.input.focus();return;
  }
  const email=e.input.value;render('submitting');busy(true);
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),config.timeoutMs||10000);
  try{const result=await save(email,controller.signal);remember();render(result.alreadySubscribed?'returning':'success');e.panel.focus({preventScroll:true});}
  catch{entries.forEach(entry=>message(entry,'We couldn’t save your email. Please try again.','error',entry===e));}
  finally{clearTimeout(timeout);busy(false);}
 }
 if(demo&&preview==='before')render('idle');
 else if(demo&&preview==='success')render('success');
 else render(read()?'returning':'idle');
 window.addEventListener('storage',event=>{if(event.key===key&&!pending&&read())render('returning');});
})();
