(() => {
  'use strict';
  const config = window.COMECAR_CONFIG || {};
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

  function checkoutUrl(value) {
    try {
      const url = new URL(value);
      if (url.protocol !== 'https:' || url.hostname !== 'pay.hotmart.com') return null;
      return window.FS_ATTRIBUTION?.checkoutUrl(url.href) || url.href;
    } catch { return null; }
  }
  $$('[data-checkout]').forEach(link => {
    const url = checkoutUrl(config.checkouts?.[link.dataset.checkout]);
    if (url) {
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
  });
  $$('[data-whatsapp]').forEach(link => {
    try {
      const url = new URL(config.whatsappLink);
      if (url.protocol === 'https:') link.href = url.href;
    } catch { /* Mantém o atendimento definido no HTML. */ }
  });

  const faqItems = $$('#faq details');
  faqItems.forEach(item => item.addEventListener('toggle', () => {
    if (item.open) faqItems.forEach(other => { if (other !== item) other.open = false; });
    requestScroll();
  }));

  // O bônus de 24 horas sai de todos os pontos da página no prazo informado.
  function updateBonus() {
    const deadline = Date.parse(config.bonusDeadline);
    if (!Number.isFinite(deadline)) return;
    if (Date.now() >= deadline) {
      $$('[data-bonus-limited]').forEach(node => node.remove());
    } else {
      setTimeout(updateBonus, Math.min(deadline - Date.now() + 100, 60000));
    }
  }
  updateBonus();
  document.addEventListener('visibilitychange', () => { if (!document.hidden) updateBonus(); });

  const faq = $('#faq');
  const whatsapp = $('#whatsapp-float');
  let scheduled = false;
  function updateScroll() {
    scheduled = false;
    whatsapp.hidden = faq.getBoundingClientRect().top >= innerHeight;
  }
  function requestScroll() {
    if (!scheduled) { scheduled = true; requestAnimationFrame(updateScroll); }
  }
  addEventListener('scroll', requestScroll, { passive: true });
  addEventListener('resize', requestScroll);
  addEventListener('load', requestScroll);
  reducedMotion.addEventListener('change', requestScroll);
  updateScroll();

  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .08 });
    $$('[data-reveal]').forEach(node => { node.classList.add('will-reveal'); observer.observe(node); });
    reducedMotion.addEventListener('change', () => {
      if (reducedMotion.matches) {
        observer.disconnect();
        $$('.will-reveal').forEach(node => node.classList.add('is-visible'));
      }
    });
  }

  const behavior = () => reducedMotion.matches ? 'auto' : 'smooth';
  const track = $('#depoimentos-track');
  function updateCounter() {
    const first = track.querySelector('article');
    if (!first) return;
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    const size = first.getBoundingClientRect().width + gap;
    const total = track.children.length;
    const start = Math.min(total, Math.round(track.scrollLeft / size) + 1);
    const visible = Math.max(1, Math.round((track.clientWidth + gap) / size));
    const end = Math.min(total, start + visible - 1);
    $('#depoimentos-counter').textContent = (start === end ? start : start + '–' + end) + ' de ' + total;
  }
  function moveTrack(direction) {
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    const size = track.querySelector('article').getBoundingClientRect().width + gap;
    const end = track.scrollWidth - track.clientWidth;
    if (direction > 0 && track.scrollLeft >= end - 5) track.scrollTo({ left: 0, behavior: behavior() });
    else if (direction < 0 && track.scrollLeft <= 5) track.scrollTo({ left: end, behavior: behavior() });
    else track.scrollBy({ left: direction * size, behavior: behavior() });
  }
  $$('[data-scroll]').forEach(button => button.addEventListener('click', () => moveTrack(Number(button.dataset.scroll))));
  track.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); moveTrack(event.key === 'ArrowRight' ? 1 : -1); }
  });
  track.addEventListener('scroll', updateCounter, { passive: true });
  addEventListener('resize', updateCounter);
  updateCounter();

  const videoDialog = $('#video-dialog');
  const videoHolder = $('#video-player');
  $$('[data-video-id]').forEach(link => link.addEventListener('click', event => {
    if (!['http:', 'https:'].includes(location.protocol) || !videoDialog.showModal || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
    const id = link.dataset.videoId;
    if (!/^[\w-]{11}$/.test(id)) return;
    event.preventDefault();
    const player = document.createElement('iframe');
    const url = new URL('https://www.youtube-nocookie.com/embed/' + id);
    url.searchParams.set('start', link.dataset.videoStart || '0');
    url.searchParams.set('autoplay', '1');
    url.searchParams.set('rel', '0');
    url.searchParams.set('origin', location.origin);
    player.src = url.href;
    player.title = 'Depoimento de ' + link.dataset.videoName;
    player.referrerPolicy = 'strict-origin-when-cross-origin';
    player.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
    player.allowFullscreen = true;
    videoHolder.replaceChildren(player);
    $('#video-dialog-title').textContent = link.dataset.videoName;
    $('#video-external').href = link.href;
    videoDialog.showModal();
  }));
  videoDialog.addEventListener('close', () => videoHolder.replaceChildren());

})();
