(function(){
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Hero background video ----------
  var heroVideo = document.querySelector('.hero-media video');
  if(heroVideo){
    if(reducedMotion){
      heroVideo.removeAttribute('autoplay');
      heroVideo.pause();
    } else {
      heroVideo.play().catch(function(){});
    }
  }

  // ---------- Process banner background video ----------
  var processVideo = document.querySelector('.process-banner video');
  if(processVideo){
    if(reducedMotion){
      processVideo.removeAttribute('autoplay');
      processVideo.pause();
    } else {
      processVideo.play().catch(function(){});
    }
  }

  // ---------- Portfolio item videos ----------
  document.querySelectorAll('.portfolio-item video').forEach(function(video){
    if(reducedMotion){
      video.removeAttribute('autoplay');
      video.pause();
    } else {
      video.play().catch(function(){});
    }
  });

  // ---------- Entrance loader ----------
  var loader = document.getElementById('loader');
  if(loader && !reducedMotion){
    var MIN_LOADER_MS = 1500;
    var start = Date.now();

    requestAnimationFrame(function(){
      setTimeout(function(){ loader.classList.add('ready'); }, 100);
    });

    function finishLoader(){
      loader.classList.add('done');
      document.body.classList.remove('loading');
      document.body.classList.add('loaded');
      setTimeout(function(){ if(loader.parentNode) loader.parentNode.removeChild(loader); }, 950);
    }

    window.addEventListener('load', function(){
      var wait = Math.max(0, MIN_LOADER_MS - (Date.now() - start));
      setTimeout(finishLoader, wait);
    });
    // Safety net in case 'load' never fires (slow/blocked asset)
    setTimeout(finishLoader, 4000);
  } else {
    if(loader && loader.parentNode) loader.parentNode.removeChild(loader);
    document.body.classList.remove('loading');
    document.body.classList.add('loaded');
  }

  // ---------- Scroll reveal ----------
  document.querySelectorAll('.stagger').forEach(function(group){
    Array.prototype.forEach.call(group.children, function(el, i){
      el.classList.add('reveal');
      if(!reducedMotion) el.style.transitionDelay = (i * 100) + 'ms';
    });
  });

  var revealEls = document.querySelectorAll('.reveal');
  if(reducedMotion || !('IntersectionObserver' in window)){
    revealEls.forEach(function(el){ el.classList.add('in-view'); });
  } else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function(el){ io.observe(el); });
  }

  // ---------- Image/video carousels ----------
  document.querySelectorAll('.carousel').forEach(function(carousel){
    var slides = carousel.querySelectorAll('.carousel-slide');
    var dots = carousel.querySelectorAll('.carousel-dot');
    if(slides.length < 2) return;
    var idx = 0;
    var timer = null;
    var baseDuration = 4500;
    var firstSlideX2 = carousel.hasAttribute('data-first-slide-x2');
    var startMidway = carousel.hasAttribute('data-start-midway');

    function playVideo(video){
      function seekAndPlay(){
        if(startMidway && video.duration){ video.currentTime = video.duration / 2; }
        else { video.currentTime = 0; }
        video.play().catch(function(){});
      }
      if(startMidway && video.readyState < 1){
        video.addEventListener('loadedmetadata', seekAndPlay, { once: true });
      } else {
        seekAndPlay();
      }
    }

    function goTo(i){
      var prevVideo = slides[idx].querySelector('video');
      if(prevVideo) prevVideo.pause();
      slides[idx].classList.remove('is-active');
      if(dots[idx]) dots[idx].classList.remove('is-active');

      idx = (i + slides.length) % slides.length;
      slides[idx].classList.add('is-active');
      if(dots[idx]) dots[idx].classList.add('is-active');

      var nextVideo = slides[idx].querySelector('video');
      if(nextVideo) playVideo(nextVideo);
    }

    function scheduleNext(){
      if(reducedMotion) return;
      clearTimeout(timer);
      var duration = (firstSlideX2 && idx === 0) ? baseDuration * 2 : baseDuration;
      timer = setTimeout(function(){ goTo(idx + 1); scheduleNext(); }, duration);
    }

    dots.forEach(function(dot, i){
      dot.addEventListener('click', function(){
        goTo(i);
        scheduleNext();
      });
    });

    var initialVideo = slides[idx].querySelector('video');
    if(initialVideo) playVideo(initialVideo);

    scheduleNext();
  });

  var LANG_KEY = 'scd_lang';

  function applyLang(lang){
    lang = lang === 'es' ? 'es' : 'en';
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-en]').forEach(function(el){
      var val = el.getAttribute(lang === 'es' ? 'data-es' : 'data-en');
      if(val !== null) el.innerHTML = val;
    });
    document.querySelectorAll('.lang-btn').forEach(function(btn){
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    try{ localStorage.setItem(LANG_KEY, lang); }catch(e){}
  }

  document.querySelectorAll('.lang-btn').forEach(function(btn){
    btn.addEventListener('click', function(){ applyLang(btn.dataset.lang); });
  });

  var saved = null;
  try{ saved = localStorage.getItem(LANG_KEY); }catch(e){}
  if(saved) applyLang(saved);

  // Mobile menu
  var menuToggle = document.getElementById('menuToggle');
  var navLinks = document.getElementById('navLinks');
  var navBackdrop = document.getElementById('navBackdrop');
  function closeMenu(){
    navLinks.classList.remove('open');
    if(navBackdrop) navBackdrop.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }
  if(menuToggle && navLinks){
    menuToggle.addEventListener('click', function(){
      var open = navLinks.classList.toggle('open');
      if(navBackdrop) navBackdrop.classList.toggle('open', open);
      menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    if(navBackdrop) navBackdrop.addEventListener('click', closeMenu);
    navLinks.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){
        closeMenu();
      });
    });
  }

  // Header scroll state
  var header = document.getElementById('siteHeader');
  function onScroll(){
    if(!header) return;
    header.style.boxShadow = window.scrollY > 8 ? '0 8px 30px rgba(0,0,0,.35)' : 'none';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Footer year
  var yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();
})();
