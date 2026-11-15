(() => {
  'use strict';
  const config = window.FS_CONFIG || {};
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const motionAllowed = () => !reducedMotion.matches && innerWidth > 650;
  const behavior = () => reducedMotion.matches ? 'instant' : 'smooth';
  function safeLink(value) {
    if (!value) return null;
    try { const url = new URL(value); return url.protocol === 'https:' ? url.href : null; }
    catch { return null; }
  }
  function checkoutLink(value) {
    const url = safeLink(value);
    return url ? (window.FS_ATTRIBUTION?.checkoutUrl(url) || url) : null;
  }
  const comboCheckout = $('[data-combo-checkout]');
  const comboUrl = checkoutLink(config.checkouts?.combo_em_formacao);
  if (comboUrl) comboCheckout.href = comboUrl;
  $$('[data-whatsapp]').forEach(link => {
    const url = safeLink(config.whatsappLink);
    if (url) link.href = url;
  });
  $$('[data-course-checkout]').forEach(link => {
    const url = checkoutLink(config.checkouts?.[link.dataset.courseCheckout]);
    if (url) {
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.removeAttribute('aria-disabled');
      link.removeAttribute('tabindex');
      link.querySelector('span').textContent = 'Quero este curso';
    } else {
      link.addEventListener('click', event => event.preventDefault());
    }
  });
  $$('dialog').forEach(dialog => {
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const r = dialog.getBoundingClientRect();
      if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
    });
  });

  // Navegação por teclado e menu em telas pequenas.
  const menu = $('#site-nav');
  const menuToggle = $('#menu-toggle');
  const closeMenu = () => {
    menu.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir menu');
  };
  menuToggle.addEventListener('click', () => {
    const expanded = menu.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(expanded));
    menuToggle.setAttribute('aria-label', expanded ? 'Fechar menu' : 'Abrir menu');
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  document.addEventListener('click', event => { if (!$('#site-header').contains(event.target)) closeMenu(); });

  // Fotografias existentes se movem com a rolagem; sem vídeo externo ou download de frames.
  const cine = $('#inicio');
  const stage = $('#cine-stage');
  const moments = $$('.cine-moment');
  const pagination = $$('.cine-pagination span');
  const purchaseBar = $('#purchase-bar');
  const investment = $('#investimento');
  const whatsappFloat = $('#whatsapp-float');
  const faqSection = $('#faq');
  let activeMoment = -1;
  let scheduled = false;
  function updateScroll() {
    scheduled = false;
    const pageDistance = document.documentElement.scrollHeight - innerHeight;
    $('#reading-progress').style.transform = 'scaleX(' + (pageDistance > 0 ? Math.min(1, scrollY / pageDistance) : 0) + ')';
    const rect = cine.getBoundingClientRect();
    const travel = Math.max(1, cine.offsetHeight - stage.offsetHeight);
    const progress = motionAllowed() ? Math.max(0, Math.min(1, (88 - rect.top) / travel)) : 0;
    stage.style.setProperty('--cine-progress', progress.toFixed(4));
    const current = motionAllowed() ? Math.min(2, Math.floor(progress * 3)) : 0;
    if (current !== activeMoment) {
      activeMoment = current;
      moments.forEach((moment, index) => {
        moment.classList.toggle('is-active', index === current);
        moment.inert = index !== current;
        moment.setAttribute('aria-hidden', String(index !== current));
      });
      pagination.forEach((item, index) => item.classList.toggle('is-active', index === current));
    }
    // O atendimento flutuante aparece quando o FAQ entra na tela e segue visível abaixo dele.
    whatsappFloat.hidden = faqSection.getBoundingClientRect().top >= innerHeight;
    const offerRect = investment.getBoundingClientRect();
    const contactRect = $('#contato').getBoundingClientRect();
    const footerRect = $('.footer').getBoundingClientRect();
    const visible = rect.bottom < 0 && !(offerRect.top < innerHeight && offerRect.bottom > 0) && !(contactRect.top < innerHeight && contactRect.bottom > 0) && footerRect.top > innerHeight;
    purchaseBar.hidden = !visible;
    document.body.classList.toggle('has-purchase-bar', visible);
  }
  function requestScroll() { if (!scheduled) { scheduled = true; requestAnimationFrame(updateScroll); } }
  addEventListener('scroll', requestScroll, { passive: true });
  addEventListener('resize', requestScroll);
  reducedMotion.addEventListener('change', requestScroll);
  updateScroll();
  addEventListener('load', requestScroll);

  const teachersToggle = $('#teachers-toggle');
  teachersToggle.addEventListener('click', () => {
    const expanded = $('#teachers-grid').classList.toggle('is-expanded');
    teachersToggle.setAttribute('aria-expanded', String(expanded));
    teachersToggle.innerHTML = expanded ? 'Mostrar menos especialistas <span aria-hidden="true">−</span>' : 'Conhecer os 20 especialistas <span aria-hidden="true">+</span>';
    if (!expanded) $('#professores').scrollIntoView({ behavior: behavior(), block: 'start' });
    requestScroll();
  });

  const faq = $$('.faq details');
  faq.forEach(item => item.addEventListener('toggle', () => {
    if (item.open) faq.forEach(other => { if (other !== item) other.open = false; });
    requestScroll();
  }));

  // A data do bônus segue exatamente a configuração da campanha original, com fuso explícito.
  function updateBonus() {
    const deadline = Date.parse(config.bonusDeadline);
    if (!Number.isFinite(deadline)) return;
    if (Date.now() >= deadline) {
      document.documentElement.classList.add('bonus-expired');
      $$('[data-bonus-limited]').forEach(item => item.remove());
      requestScroll();
    } else {
      setTimeout(updateBonus, Math.min(deadline - Date.now() + 100, 60000));
    }
  }
  updateBonus();
  document.addEventListener('visibilitychange', () => { if (!document.hidden) updateBonus(); });

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
