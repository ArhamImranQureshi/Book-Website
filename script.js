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

document.addEventListener('DOMContentLoaded', () => {
  // 1. Reading Progress Bar
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress-bar';
  document.body.appendChild(progressBar);

  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = (window.scrollY / totalHeight) * 100;
    progressBar.style.width = `${progress}%`;
  }, { passive: true });

  // 2. Interactive 3D Book Cover Tilt (Desktop Only)
  const cover = document.querySelector('.book-cover');
  const container = document.querySelector('.book-cover-container');

  if (cover && container && window.matchMedia('(min-width: 768px)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    container.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;

      cover.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    container.addEventListener('mouseleave', () => {
      cover.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  }

  // 3. Scroll-Triggered Fade-In Animations (IntersectionObserver)
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };

  const observer = new IntersectionObserver((entries, observerInstance) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observerInstance.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const animateElements = document.querySelectorAll('.timeline-item, .reading-container p, .gallery-item');
  animateElements.forEach(el => {
    observer.observe(el);
  });

  // 4. Accessible Archival Gallery Lightbox
  const galleryItems = document.querySelectorAll('.gallery-item');
  if (galleryItems.length > 0) {
    const modal = document.createElement('div');
    modal.className = 'lightbox-modal';
    modal.innerHTML = `
      <button class="lightbox-close" aria-label="Close lightbox">&times;</button>
      <img class="lightbox-content" src="" alt="">
    `;
    document.body.appendChild(modal);

    const modalImg = modal.querySelector('.lightbox-content');
    const closeBtn = modal.querySelector('.lightbox-close');

    galleryItems.forEach(item => {
      const img = item.querySelector('img');
      if (img) {
        img.style.cursor = 'pointer';
        img.addEventListener('click', () => {
          modalImg.src = img.src;
          modalImg.alt = img.alt || 'Archival historical photograph';
          modal.classList.add('active');
          document.body.style.overflow = 'hidden';
        });
      }
    });

    const closeModal = () => {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    };

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
    });
  }
});



document.addEventListener("DOMContentLoaded", () => {
  const stats = document.querySelectorAll(".stat");

  // Create custom cursor element dynamically
  const cursor = document.createElement("div");
  cursor.classList.add("book-cursor");
  document.body.appendChild(cursor);

  stats.forEach((stat) => {
    const imgSrc = stat.getAttribute("data-cursor");

    stat.addEventListener("mouseenter", () => {
      cursor.style.backgroundImage = `url('${imgSrc}')`;
      cursor.style.opacity = "1";
    });

    stat.addEventListener("mouseleave", () => {
      cursor.style.opacity = "0";
    });

    stat.addEventListener("mousemove", (e) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("random-bg-container");
  if (!container) return;

  // Aap yahan apni jitni marzi images ke paths add kar sakte hain
  const imagesList = [
    "img/cover.jpg",
    "img/cover.jpg",
    "img/cover.jpg",
    "img/cover.jpg",
    "img/cover.jpg"
  ];

  function showRandomImage() {
    // 1. Random Image select karein
    const randomImgSrc = imagesList[Math.floor(Math.random() * imagesList.length)];

    // 2. Image element create karein
    const imgDiv = document.createElement("div");
    imgDiv.classList.add("dynamic-fade-img");
    imgDiv.style.backgroundImage = `url('${randomImgSrc}')`;

    // 3. Random Position generate karein (Safe area: 5% se 75% tak taakay text ke upar na aaye)
    const randomTop = Math.floor(Math.random() * 70) + 5; 
    const randomLeft = Math.floor(Math.random() * 75) + 10;

    imgDiv.style.top = `${randomTop}%`;
    imgDiv.style.left = `${randomLeft}%`;

    // 4. Container mein add karein
    container.appendChild(imgDiv);

    // 5. Fade In (Thore delay ke sath taakay transition trigger ho)
    setTimeout(() => {
      imgDiv.style.opacity = "0.75"; // Transparency (0 se 1 ke beech)
      imgDiv.style.transform = "scale(1.05)";
    }, 100);

    // 6. Kuch seconds baad Fade Out karke DOM se delete kar dein
    setTimeout(() => {
      imgDiv.style.opacity = "0";
      imgDiv.style.transform = "scale(0.95)";
      
      setTimeout(() => {
        imgDiv.remove();
      }, 1500); // Transition duration ke barabar time
    }, 4000); // Image kitni dair screen par rahegi (4 seconds)
  }

  // Har 2.5 seconds ke baad ek new random image spawn hogi
  setInterval(showRandomImage, 2500);
});


document.addEventListener("DOMContentLoaded", () => {
  const journeySection = document.querySelector(".journey-section");
  if (!journeySection) return;

  // 1. Card element create karke section ke andar append karein
  const hoverCard = document.createElement("div");
  hoverCard.classList.add("journey-hover-card");
  hoverCard.innerHTML = `
    <div class="card-img"></div>
    <div class="card-content">
      <h5 class="card-title"></h5>
      <p class="card-desc"></p>
    </div>
  `;
  journeySection.appendChild(hoverCard);

  const stops = document.querySelectorAll(".journey .stop");

  stops.forEach((stop) => {
    const imgSrc = stop.getAttribute("data-img");
    const titleText = stop.getAttribute("data-title");
    const descText = stop.getAttribute("data-desc");

    stop.addEventListener("mouseenter", () => {
      hoverCard.querySelector(".card-img").style.backgroundImage = `url('${imgSrc}')`;
      hoverCard.querySelector(".card-title").innerHTML = titleText;
      hoverCard.querySelector(".card-desc").innerHTML = descText;

      // Card position calculate karna har stop ke upar
      const stopRect = stop.getBoundingClientRect();
      const sectionRect = journeySection.getBoundingClientRect();

      const leftPos = stopRect.left - sectionRect.left + (stopRect.width / 2);
      const topPos = stopRect.top - sectionRect.top - 95; // Dot ke thora ooper

      hoverCard.style.left = `${leftPos}px`;
      hoverCard.style.top = `${topPos}px`;

      hoverCard.classList.add("active");
    });

    stop.addEventListener("mouseleave", () => {
      hoverCard.classList.remove("active");
    });
  });
});