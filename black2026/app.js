(() => {
  'use strict';
  const config = window.BLACK2026_CONFIG || {};
  const attribution = value => window.FS_ATTRIBUTION?.checkoutUrl(value) || value;
  document.querySelectorAll('[data-offer]').forEach(link => {
    const value = config.offers?.[link.dataset.offer];
    try {
      const url = new URL(value);
      if (url.protocol === 'https:' && url.hostname === 'fisioterapeutasdosonomkt.com.br') link.href = attribution(url.href);
    } catch { /* O HTML já contém o destino da oferta. */ }
  });
  document.querySelectorAll('[data-checkout]').forEach(link => {
    const value = config.checkouts?.[link.dataset.checkout];
    try {
      const url = new URL(value);
      if (url.protocol === 'https:' && url.hostname === 'pay.hotmart.com') link.href = attribution(url.href);
    } catch { /* O HTML já contém o checkout oficial. */ }
  });
  function updateBonus() {
    const deadline = Date.parse(config.bonusDeadline);
    if (!Number.isFinite(deadline)) return;
    if (Date.now() >= deadline) {
      document.querySelectorAll('[data-bonus-limited]').forEach(node => node.remove());
    } else {
      setTimeout(updateBonus, Math.min(deadline - Date.now() + 100, 60000));
    }
  }
  updateBonus();
  document.addEventListener('visibilitychange', () => { if (!document.hidden) updateBonus(); });
})();
