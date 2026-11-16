(() => {
  'use strict';

  // Mantém a última campanha informada na URL, como no código fornecido.
  const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  const storageKey = 'fds_utms';
  const params = new URLSearchParams(window.location.search);
  let utms = {};
  keys.forEach(key => {
    const value = params.get(key);
    if (value) utms[key] = value;
  });

  try {
    if (Object.keys(utms).length) {
      window.localStorage.setItem(storageKey, JSON.stringify(utms));
    } else {
      const saved = JSON.parse(window.localStorage.getItem(storageKey) || '{}');
      if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
        keys.forEach(key => {
          if (typeof saved[key] === 'string' && saved[key]) utms[key] = saved[key];
        });
      }
    }
  } catch {
    // A compra continua funcionando se o armazenamento estiver indisponível.
  }

  function checkoutUrl(value) {
    try {
      const url = new URL(value);
      if (url.protocol !== 'https:' || !['pay.hotmart.com', 'fisioterapeutasdosonomkt.com.br'].includes(url.hostname)) return value;
      if (!Object.keys(utms).length) return value;
      keys.forEach(key => {
        if (utms[key]) url.searchParams.set(key, utms[key]);
      });
      return url.href;
    } catch {
      return value;
    }
  }

  // A página usa checkouts diretos; as UTMs acompanham esses links.
  window.FS_ATTRIBUTION = Object.freeze({ checkoutUrl });
})();
