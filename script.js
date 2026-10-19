(function(){
const d=document,$=(s,c=d)=>c.querySelector(s),$$=(s,c=d)=>[...c.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* preloader (once per session) */
const pre=$('#pre');
let seen=false;try{seen=sessionStorage.getItem('sob')}catch(e){}
if(pre){
  if(seen){pre.remove()}
  else{setTimeout(()=>{pre.classList.add('out');setTimeout(()=>pre.remove(),900)},2000);try{sessionStorage.setItem('sob','1')}catch(e){}}
}
/* if preloader skipped, hero animations should not wait */
if(seen||!pre){d.documentElement.classList.add('fast')}

/* reveal on scroll */
$$('article.post .narrow > p,article.post figure,article.post h3,article.post .pull,.timeline .t,.grid figure,.stat,.card,.rv-auto').forEach((e,i)=>{e.classList.add('rv')});
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){
  const el=e.target;el.style.setProperty('--d',(el.dataset.d||0)+'s');el.classList.add('in');io.unobserve(el);
  if(el.classList.contains('stat'))count(el.querySelector('b'));
}}),{threshold:.14,rootMargin:'0px 0px -6% 0px'});
$$('.rv').forEach((e,i)=>{ if(e.parentElement.classList.contains('cards')||e.parentElement.classList.contains('stats')){e.dataset.d=(([...e.parentElement.children].indexOf(e))*.12).toFixed(2)} io.observe(e)});
function sweep(){ $$('.rv:not(.in)').forEach(el=>{ if(el.getBoundingClientRect().top<innerHeight*.94){ el.classList.add('in'); io.unobserve(el); if(el.classList.contains('stat'))count(el.querySelector('b')); } }); $$('.journey:not(.in)').forEach(j=>{ if(j.getBoundingClientRect().top<innerHeight*.65)j.classList.add('in') }); }
const jio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');jio.unobserve(e.target)}}),{threshold:.35});
$$('.journey').forEach(j=>jio.observe(j));

/* counters */
function count(el){
  if(!el||el.dataset.done)return;el.dataset.done=1;
  const to=+el.dataset.to,suf=el.dataset.suf||'';
  if(reduce){el.textContent=to+suf;return}
  const t0=performance.now(),dur=1800;
  (function f(t){const p=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-p,4);el.textContent=Math.round(to*e)+suf;if(p<1)requestAnimationFrame(f)})(t0);
}

/* header, progress, back-to-top, timeline fill */
const hd=$('header.site'),bar=$('#bar'),top=$('#top'),tl=$('.timeline');
function onScroll(){
  sweep();
  const y=scrollY,h=d.documentElement.scrollHeight-innerHeight;
  hd&&hd.classList.toggle('sc',y>20);
  if(bar)bar.style.width=(h>0?y/h*100:0)+'%';
  top&&top.classList.toggle('on',y>700);
  if(tl){const r=tl.getBoundingClientRect();const p=Math.max(0,Math.min(1,(innerHeight*.6-r.top)/r.height));tl.style.setProperty('--h',(p*100)+'%')}
  $$('.hero .cover-wrap').forEach(c=>{if(y<innerHeight)c.style.translate='0 '+(y*.08)+'px'});
}
addEventListener('scroll',onScroll,{passive:true});onScroll();
top&&top.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));

/* hero: spotlight, cover tilt, embers */
const hero=$('.hero');
if(hero&&!reduce){
  hero.addEventListener('mousemove',e=>{const r=hero.getBoundingClientRect();hero.style.setProperty('--mx',(e.clientX-r.left)+'px');hero.style.setProperty('--my',(e.clientY-r.top)+'px')});
  const cv=$('.cover-wrap .cover');
  if(cv){const w=cv.parentElement;
    w.addEventListener('mousemove',e=>{const r=w.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;cv.style.animation='none';cv.style.opacity=1;cv.style.transform=`rotateY(${x*16}deg) rotateX(${-y*14}deg) scale(1.03)`});
    w.addEventListener('mouseleave',()=>{cv.style.transform='rotate(1.5deg)'});}
}
const cvs=$('#embers');
if(cvs&&!reduce){
  const c=cvs.getContext('2d');let W,H,P=[];
  const rs=()=>{W=cvs.width=cvs.offsetWidth;H=cvs.height=cvs.offsetHeight};rs();addEventListener('resize',rs);
  const mk=()=>({x:Math.random()*W,y:H+Math.random()*40,r:Math.random()*1.9+.4,s:Math.random()*.6+.25,dx:(Math.random()-.5)*.4,a:Math.random()*.6+.2,t:Math.random()*6});
  for(let i=0;i<70;i++){const p=mk();p.y=Math.random()*H;P.push(p)}
  (function loop(){c.clearRect(0,0,W,H);
    P.forEach((p,i)=>{p.y-=p.s;p.t+=.02;p.x+=p.dx+Math.sin(p.t)*.3;
      const fade=Math.min(1,p.y/(H*.35));
      c.beginPath();c.fillStyle=`rgba(240,206,120,${p.a*fade})`;c.shadowColor='rgba(240,200,100,.9)';c.shadowBlur=8;c.arc(p.x,p.y,p.r,0,6.3);c.fill();
      if(p.y<-10)P[i]=mk()});
    requestAnimationFrame(loop)})();
}

/* card spotlight + tilt */
if(!reduce)$$('.card').forEach(c=>{
  c.addEventListener('mousemove',e=>{const r=c.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
    c.style.setProperty('--cx',x+'px');c.style.setProperty('--cy',y+'px');
    c.style.transform=`perspective(800px) rotateX(${(.5-y/r.height)*6}deg) rotateY(${(x/r.width-.5)*8}deg) translateY(-4px)`});
  c.addEventListener('mouseleave',()=>c.style.transform='');
});

/* quote slider */
const qs=$('.qs');
if(qs){const qq=$$('blockquote',qs),dots=$('.qd');let i=0,tm;
  qq.forEach((_,k)=>{const b=d.createElement('button');b.setAttribute('aria-label','Quote '+(k+1));b.onclick=()=>{go(k);auto()};dots.appendChild(b)});
  function go(n){i=n;qq.forEach((q,k)=>q.classList.toggle('on',k===i));$$('button',dots).forEach((b,k)=>b.classList.toggle('on',k===i))}
  function auto(){clearInterval(tm);tm=setInterval(()=>go((i+1)%qq.length),6500)}
  go(0);auto();
}

/* gallery lightbox with prev/next */
const lb=$('#lb');
if(lb){
  const figs=$$('.grid figure'),li=$('#lbi'),lc=$('#lbc');let n=0;
  const show=k=>{n=(k+figs.length)%figs.length;li.style.animation='none';li.offsetHeight;li.style.animation='';li.src=figs[n].querySelector('img').src;lc.textContent=figs[n].dataset.cap;lb.classList.add('on')};
  figs.forEach((f,k)=>f.addEventListener('click',()=>show(k)));
  $('.pv',lb).onclick=e=>{e.stopPropagation();show(n-1)};$('.nx',lb).onclick=e=>{e.stopPropagation();show(n+1)};
  $('.cl',lb).onclick=()=>lb.classList.remove('on');
  lb.addEventListener('click',e=>{if(e.target===lb)lb.classList.remove('on')});
  d.addEventListener('keydown',e=>{if(!lb.classList.contains('on'))return;if(e.key==='Escape')lb.classList.remove('on');if(e.key==='ArrowLeft')show(n-1);if(e.key==='ArrowRight')show(n+1)});
}
})();

