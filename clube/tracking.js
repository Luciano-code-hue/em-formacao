(() => {
  'use strict';

  // Guarda a última campanha que veio na URL (mesma chave das páginas da Black)
  // e repassa as UTMs para os checkouts da Eduzz e da Hotmart.
  const chaves = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  const armazenamento = 'fds_utms';
  const params = new URLSearchParams(window.location.search);
  let utms = {};
  chaves.forEach((k) => {
    const v = params.get(k);
    if (v) utms[k] = v;
  });

  try {
    if (Object.keys(utms).length) {
      window.localStorage.setItem(armazenamento, JSON.stringify(utms));
    } else {
      const salvo = JSON.parse(window.localStorage.getItem(armazenamento) || '{}');
      if (salvo && typeof salvo === 'object' && !Array.isArray(salvo)) {
        chaves.forEach((k) => {
          if (typeof salvo[k] === 'string' && salvo[k]) utms[k] = salvo[k];
        });
      }
    }
  } catch {
    // A compra continua funcionando se o armazenamento estiver indisponível.
  }

  const dominios = ['chk.eduzz.com', 'pay.hotmart.com'];

  function checkoutUrl(valor) {
    try {
      const url = new URL(valor);
      if (url.protocol !== 'https:' || !dominios.includes(url.hostname)) return valor;
      if (!Object.keys(utms).length) return valor;
      chaves.forEach((k) => {
        if (utms[k]) url.searchParams.set(k, utms[k]);
      });
      return url.href;
    } catch {
      return valor;
    }
  }

  function aplicar() {
    document.querySelectorAll('a[data-checkout]').forEach((a) => {
      a.href = checkoutUrl(a.getAttribute('href'));
      a.addEventListener('click', () => {
        // Evento para o GTM: permite disparar InitiateCheckout (Meta) e conversão (Google Ads).
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'clube_checkout',
          plano: a.dataset.plano || '',
          aluno_fs: a.dataset.alunoFs === 'sim',
        });
      });
    });
    document.querySelectorAll('a[data-whats]').forEach((a) => {
      a.addEventListener('click', () => {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: 'clube_whatsapp' });
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', aplicar);
  else aplicar();

  window.FS_ATTRIBUTION = Object.freeze({ checkoutUrl });
})();
