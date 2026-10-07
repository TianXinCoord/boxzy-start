(() => {
 'use strict';
 const hero = document.querySelector('.hero');
 if (!hero || !('IntersectionObserver' in window)) return;

 let inView = true;
 const syncPlayback = () => hero.classList.toggle('is-motion-paused', document.hidden || !inView);
 const observer = new IntersectionObserver(([entry]) => {
  inView = entry.isIntersecting;
  syncPlayback();
 }, {threshold: 0.05});

 observer.observe(hero);
 document.addEventListener('visibilitychange', syncPlayback);
})();
