(() => {
  async function renderMermaid() {
    if (typeof window.mermaid === 'undefined') return;
    const nodes = [...document.querySelectorAll('pre.mermaid')];
    if (nodes.length === 0) return;

    for (const node of nodes) {
      if (!node.dataset.mermaidSrc) {
        node.dataset.mermaidSrc = node.textContent ?? '';
      } else {
        node.removeAttribute('data-processed');
        node.textContent = node.dataset.mermaidSrc;
      }
    }

    const theme = document.documentElement.dataset.theme === 'light' ? 'default' : 'dark';
    window.mermaid.initialize({
      startOnLoad: false,
      theme,
      securityLevel: 'strict',
      class: { useMaxWidth: true },
    });
    await window.mermaid.run({ nodes });
  }

  function init() {
    renderMermaid();
    const observer = new MutationObserver(() => {
      renderMermaid();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
