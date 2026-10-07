(() => {
  const profiles = window.BOXZY_SOCIAL || {};
  document.querySelectorAll('[data-social]').forEach(link => {
    const value = profiles[link.dataset.social];
    if (!value) return;
    try {
      const url = new URL(value);
      if (url.protocol !== 'https:') return;
      link.href = url.href;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.removeAttribute('aria-disabled');
      link.setAttribute('aria-label', link.getAttribute('aria-label').replace(/ \(opens in a new tab\)$/, '') + ' (opens in a new tab)');
    } catch (_) { /* Leave unconfigured accounts non-interactive. */ }
  });
})();
