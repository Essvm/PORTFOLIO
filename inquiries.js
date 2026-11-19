/* Project requests are sent to the owner's private inbox. */
(function(root){
'use strict';
const API=['localhost','127.0.0.1'].includes(location.hostname)?'':'https://essam-portfolio-metrics.rubyplume16385.chatgpt.site';
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const preview=()=>root.PORTFOLIO_PREVIEW===true;
function activeProject(){const id=document.body.dataset.projectId||new URLSearchParams(location.search).get('id');if(id)return id;const file=location.pathname.split('/').pop().replace('.html','');if(file&&file!=='index'&&file!=='project')return file;try{return sessionStorage.getItem('ea.analytics.lastProject')||'';}catch{return '';}}
function mount(){
 if(document.querySelector('#project-inquiry')||root.PORTFOLIO_SETTINGS?.leadFormEnabled===false)return;
 const main=document.querySelector('main');if(!main)return;const services=root.PORTFOLIO_SETTINGS?.services||[];
 const section=document.createElement('section');section.id='project-inquiry';section.className='container inquiry-section';
 section.innerHTML='<div class="section-header-tab mint"><h2 class="section-title">LET’S BUILD SOMETHING.</h2></div><div class="inquiry-panel"><p class="inquiry-intro">Tell me about your project, and I’ll get back to you by email.</p><form class="inquiry-form" data-enquiry-form><label>Your name<input name="name" autocomplete="name" required minlength="2" maxlength="100"></label><label>Email address<input name="email" type="email" autocomplete="email" required maxlength="180"></label><label>Phone <span>(optional)</span><input name="phone" type="tel" autocomplete="tel" maxlength="35"></label><label>Service<select name="service"><option value="">Select a service</option>'+services.map(s=>'<option value="'+escape(s.title)+'">'+escape(s.title)+'</option>').join('')+'<option value="Other">Other</option></select></label><label class="inquiry-full">Budget <span>(optional)</span><input name="budget" maxlength="100" placeholder="Your estimated budget and currency"></label><label class="inquiry-full">Project details<textarea name="message" required minlength="10" maxlength="6000" rows="5" placeholder="What are you working on, and what do you need?"></textarea></label><label class="inquiry-honeypot" aria-hidden="true">Company website<input name="companyWebsite" tabindex="-1" autocomplete="off"></label><div class="inquiry-submit inquiry-full"><div><button type="submit" class="inquiry-button" disabled>Preparing form…</button><p class="inquiry-small">Share the best contact details for a reply.</p></div><p data-inquiry-status role="status" aria-live="polite"></p></div></form></div>';
 main.append(section);const form=section.querySelector('form'),button=form.querySelector('[type="submit"]'),status=form.querySelector('[data-inquiry-status]');
 if(preview()){form.querySelectorAll('input,textarea,select,button').forEach(el=>el.disabled=true);button.textContent='Preview only';status.textContent='Requests are disabled in draft previews.';return;}
 let token='',sending=false;
 async function refreshToken(){const response=await fetch(API+'/inquiry-token',{mode:'cors',credentials:'omit',cache:'no-store'});if(!response.ok)throw Error('The form is temporarily unavailable. Please use the contact links above.');const body=await response.json();token=body.token;button.disabled=false;button.textContent='Send project request';}
 refreshToken().catch(e=>{status.textContent=e.message;button.textContent='Form unavailable';});
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(sending||!token||!form.reportValidity())return;sending=true;button.disabled=true;button.textContent='Sending…';status.textContent='';
  const values=Object.fromEntries(new FormData(form));values.token=token;values.projectId=activeProject();
  try{const response=await fetch(API+'/inquiries',{method:'POST',mode:'cors',credentials:'omit',headers:{'Content-Type':'application/json'},body:JSON.stringify(values)});const body=await response.json();if(!response.ok){if(body.refreshToken)await refreshToken();throw Error(body.error||'Your request could not be sent. Please try again.');}form.reset();status.textContent='Thank you — your project request has been received. I’ll get back to you using your contact details.';status.className='inquiry-success';await refreshToken();}
  catch(error){status.textContent=error.message;status.className='inquiry-error';}
  finally{sending=false;button.disabled=!token;button.textContent='Send project request';}
 });
}
root.PortfolioInquiries={mount};document.addEventListener('portfolio-ready',mount);
})(globalThis);
