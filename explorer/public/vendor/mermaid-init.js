(() => {
  function renderMermaid() {
    if (typeof window.mermaid === 'undefined') return;
    const nodes = document.querySelectorAll('pre.mermaid');
    if (nodes.length === 0) return;

    const theme = document.documentElement.dataset.theme === 'light' ? 'default' : 'dark';
    window.mermaid.initialize({
      startOnLoad: false,
      theme,
      securityLevel: 'loose',
      class: { useMaxWidth: true },
    });
    window.mermaid.run({ nodes });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderMermaid);
  } else {
    renderMermaid();
  }
})();
