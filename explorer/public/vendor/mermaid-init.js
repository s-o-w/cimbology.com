(() => {
  function themeVars(isLight) {
    if (isLight) {
      return {
        background: '#eaf2ea',
        primaryColor: '#ffffff',
        primaryTextColor: '#19261a',
        primaryBorderColor: '#2c5f2d',
        secondaryColor: '#f5f8f5',
        tertiaryColor: '#dfeedf',
        lineColor: '#e25c04',
        textColor: '#19261a',
        classText: '#19261a',
      };
    }
    return {
      background: '#162418',
      primaryColor: '#1d3120',
      primaryTextColor: '#eef5ee',
      primaryBorderColor: '#4ca950',
      secondaryColor: '#162418',
      tertiaryColor: '#243827',
      lineColor: '#f58b42',
      textColor: '#eef5ee',
      classText: '#eef5ee',
    };
  }

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

    const isLight = document.documentElement.dataset.theme === 'light';
    window.mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      themeVariables: themeVars(isLight),
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
