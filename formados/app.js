(() => {
  'use strict';
  const config = window.FORMADOS_CONFIG || {};
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

  const toggle = $('#menu-toggle');
  const menu = $('#site-nav');
  function closeMenu() {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
    menu.classList.remove('is-open');
  }
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    menu.classList.toggle('is-open', open);
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  document.addEventListener('click', event => { if (!$('#site-header').contains(event.target)) closeMenu(); });

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

  const hero = $('#inicio');
  const offer = $('#investimento');
  const faq = $('#faq');
  const contact = $('#contato');
  const footer = $('.site-footer');
  const bar = $('#purchase-bar');
  const whatsapp = $('#whatsapp-float');
  let scheduled = false;
  function updateScroll() {
    scheduled = false;
    const distance = document.documentElement.scrollHeight - innerHeight;
    $('#reading-progress').style.transform = 'scaleX(' + (distance > 0 ? Math.min(1, scrollY / distance) : 0) + ')';
    const rect = offer.getBoundingClientRect();
    const contactRect = contact.getBoundingClientRect();
    const inOffer = rect.top < innerHeight && rect.bottom > 0;
    const inContact = contactRect.top < innerHeight && contactRect.bottom > 0;
    bar.hidden = hero.getBoundingClientRect().bottom > 0 || inOffer || inContact || footer.getBoundingClientRect().top < innerHeight;
    document.body.classList.toggle('has-purchase-bar', !bar.hidden);
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
})();
