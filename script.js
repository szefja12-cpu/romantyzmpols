(function(){
  const qs = (s, root=document) => root.querySelector(s);
  const qsa = (s, root=document) => [...root.querySelectorAll(s)];

  // Pasek przewijania
  const progress = qs('#progressBar');
  const updateProgress = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    progress.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
  };
  document.addEventListener('scroll', updateProgress, {passive:true});
  updateProgress();

  // Menu mobilne
  const mobileMenu = qs('#mobileMenu');
  const navLinks = qs('#navLinks');
  mobileMenu?.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    mobileMenu.setAttribute('aria-expanded', String(open));
  });
  qsa('#navLinks a').forEach(a => a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    mobileMenu?.setAttribute('aria-expanded','false');
  }));

  // Zmiana motywu zachowana w pamięci przeglądarki
  const themeBtn = qs('#themeBtn');
  const savedTheme = localStorage.getItem('romantyzm-theme');
  if(savedTheme === 'light') document.body.classList.add('light-mode');
  themeBtn?.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    localStorage.setItem('romantyzm-theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
  });

  // Animacje wejścia
  const revealItems = qsa('.reveal');
  if('IntersectionObserver' in window){
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, {threshold:.12});
    revealItems.forEach(el => observer.observe(el));
  }else{
    revealItems.forEach(el => el.classList.add('visible'));
  }

  // Modal pojęć
  const modal = qs('#termModal');
  const modalTitle = qs('#modalTitle');
  const modalDesc = qs('#modalDesc');
  const closeModal = () => { modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); document.body.style.overflow=''; };
  qsa('.term').forEach(btn => btn.addEventListener('click', () => {
    modalTitle.textContent = btn.dataset.title || '';
    modalDesc.textContent = btn.dataset.desc || '';
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
  }));
  qsa('[data-close-modal]').forEach(el => el.addEventListener('click', closeModal));
  document.addEventListener('keydown', e => { if(e.key === 'Escape') closeModal(); });

  // Filtr utworów
  const filters = qsa('.filter');
  const workCards = qsa('.work-card');
  filters.forEach(btn => btn.addEventListener('click', () => {
    filters.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    workCards.forEach(card => {
      const show = filter === 'all' || card.dataset.author === filter;
      card.style.display = show ? '' : 'none';
    });
  }));

  // Liczniki
  const counters = qsa('.counter');
  const animateCounter = (el) => {
    const target = Number(el.dataset.target || 0);
    const duration = target > 100 ? 1200 : 850;
    const start = performance.now();
    const tick = now => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1-p, 3);
      el.textContent = Math.round(target * eased).toLocaleString('pl-PL');
      if(p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if('IntersectionObserver' in window){
    const counterObs = new IntersectionObserver(entries => {
      entries.forEach(e => { if(e.isIntersecting){ animateCounter(e.target); counterObs.unobserve(e.target); } });
    }, {threshold:.7});
    counters.forEach(c => counterObs.observe(c));
  }else counters.forEach(c => animateCounter(c));

  // Quiz
  const quizForm = qs('#quizForm');
  const quizResult = qs('#quizResult');
  quizForm?.addEventListener('submit', e => {
    e.preventDefault();
    const questions = qsa('.quiz-q', quizForm);
    let score = 0;
    questions.forEach((q, index) => {
      const answer = qs(`input[name="q${index+1}"]:checked`, q);
      if(answer && answer.value === q.dataset.correct) score++;
    });
    const messages = [
      ['0–1/5','Romantyzm jeszcze skrywa przed Tobą kilka tajemnic. Warto wrócić do słownika pojęć i dzieł.'],
      ['2–3/5','Dobry kierunek! Masz już podstawy, teraz warto połączyć pojęcia z konkretnymi utworami.'],
      ['4/5','Bardzo dobrze! Romantyczny klimat jest Ci zdecydowanie znajomy.'],
      ['5/5','Perfekcyjnie! Możesz spokojnie wejść w „Dziady”, „Kordiana” i resztę epoki.']
    ];
    const label = score <= 1 ? messages[0] : score <=3 ? messages[1] : score ===4 ? messages[2] : messages[3];
    quizResult.innerHTML = `<strong>${score}/5</strong> — ${label[1]}`;
  });

  // Płynne przewijanie także dla przeglądarek, które ignorują scroll-behavior w niektórych sytuacjach
  qsa('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const target = id && qs(id);
    if(target){ e.preventDefault(); target.scrollIntoView({behavior:'smooth', block:'start'}); }
  }));
})();
