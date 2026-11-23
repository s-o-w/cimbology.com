(function () {
  var CIM_NS = 'http://iec.ch/TC57/CIM100#';
  var DEMO_UUID = '00000000-0000-0000-0000-000000000000';

  function turtleVal(field, className) {
    var kind = field[1];
    var extra = field[2] || '';
    switch (kind) {
      case 'mrid':
        return { v: '"' + DEMO_UUID + '"', c: '', xsd: false };
      case 'name':
        return { v: '"Example ' + className + '"', c: '', xsd: false };
      case 's':
        return { v: '"example"', c: extra ? 'cim:' + extra : '', xsd: false };
      case 'b':
        return { v: 'false', c: '', xsd: false };
      case 'i':
        return { v: '1', c: extra ? 'cim:' + extra : '', xsd: false };
      case 'f':
        return { v: '0.0', c: extra, xsd: false };
      case 'dt':
        return { v: '"2026-01-01T00:00:00Z"^^xsd:dateTime', c: '', xsd: true };
      case 'd':
        return { v: '"2026-01-01"^^xsd:date', c: '', xsd: true };
      case 't':
        return { v: '"12:00:00Z"^^xsd:time', c: '', xsd: true };
      case 'dur':
        return { v: '"PT1H"^^xsd:duration', c: '', xsd: true };
      case 'md':
        return { v: '"--01-01"^^xsd:gMonthDay', c: '', xsd: true };
      case 'e':
        return { v: extra ? 'cim:' + extra : '"example"', c: '', xsd: false };
      case 'o':
        return {
          v: '<urn:example:' + (extra || 'Resource') + '-1>',
          c: extra ? 'cim:' + extra : '',
          xsd: false,
        };
      default:
        return { v: '"example"', c: '', xsd: false };
    }
  }

  function jsonLdVal(field, className) {
    var kind = field[1];
    var extra = field[2] || '';
    switch (kind) {
      case 'mrid':
        return DEMO_UUID;
      case 'name':
        return 'Example ' + className;
      case 's':
        return 'example';
      case 'b':
        return false;
      case 'i':
        return 1;
      case 'f':
        return 0.0;
      case 'dt':
        return '2026-01-01T00:00:00Z';
      case 'd':
        return '2026-01-01';
      case 't':
        return '12:00:00Z';
      case 'dur':
        return 'PT1H';
      case 'md':
        return '--01-01';
      case 'e':
        return extra ? { '@id': 'cim:' + extra } : 'example';
      case 'o':
        return { '@id': 'urn:example:' + (extra || 'Resource') + '-1' };
      default:
        return 'example';
    }
  }

  function buildSnippets(className, iri, layers, selectedSet, includeObjects, sparseMode) {
    var groups = [];
    var totalProps = 0;

    if (sparseMode) {
      var idLayer = layers.find(function (l) {
        return l.c === 'IdentifiedObject';
      });
      if (idLayer) {
        var sparseFields = idLayer.f.filter(function (f) {
          return f[0] === 'mRID' || f[0] === 'name';
        });
        if (sparseFields.length > 0) {
          groups.push({ c: 'IdentifiedObject', f: sparseFields });
          totalProps += sparseFields.length;
        }
      }
    } else {
      for (var i = 0; i < layers.length; i++) {
        var layer = layers[i];
        if (!selectedSet.has(layer.c)) continue;
        var filtered = layer.f.filter(function (f) {
          return includeObjects || f[1] !== 'o';
        });
        if (filtered.length > 0) {
          groups.push({ c: layer.c, f: filtered });
          totalProps += filtered.length;
        }
      }
    }

    // Build Turtle instance
    var usesXsd = false;
    var stmtEntries = [];
    for (var g = 0; g < groups.length; g++) {
      var grp = groups[g];
      var isSelf = grp.c === className;
      stmtEntries.push({
        isComment: true,
        text: isSelf
          ? '    # Direct properties on cim:' + grp.c
          : '    # Inherited from cim:' + grp.c,
      });
      for (var j = 0; j < grp.f.length; j++) {
        var field = grp.f[j];
        var tv = turtleVal(field, className);
        if (tv.xsd) usesXsd = true;
        stmtEntries.push({
          isComment: false,
          pred: 'cim:' + grp.c + '.' + field[0],
          val: tv.v,
          comment: tv.c,
        });
      }
    }

    var ttlLines = ['@prefix cim: <' + CIM_NS + '> .'];
    if (usesXsd) {
      ttlLines.push('@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .');
    }
    ttlLines.push('');

    var lastPropIdx = -1;
    for (var k = stmtEntries.length - 1; k >= 0; k--) {
      if (!stmtEntries[k].isComment) {
        lastPropIdx = k;
        break;
      }
    }

    if (lastPropIdx === -1) {
      ttlLines.push('<urn:uuid:' + DEMO_UUID + '> a cim:' + className + ' .');
    } else {
      ttlLines.push('<urn:uuid:' + DEMO_UUID + '> a cim:' + className + ' ;');
      for (var m = 0; m < stmtEntries.length; m++) {
        var entry = stmtEntries[m];
        if (entry.isComment) {
          ttlLines.push(entry.text);
        } else {
          var term = m === lastPropIdx ? ' .' : ' ;';
          var cmt = entry.comment ? ' # ' + entry.comment : '';
          ttlLines.push('    ' + entry.pred + ' ' + entry.val + term + cmt);
        }
      }
    }

    // Build JSON-LD 1.1 instance
    var jsonObj = {
      '@context': {
        cim: CIM_NS,
      },
      '@id': 'urn:uuid:' + DEMO_UUID,
      '@type': iri,
    };
    for (var g2 = 0; g2 < groups.length; g2++) {
      var grp2 = groups[g2];
      for (var j2 = 0; j2 < grp2.f.length; j2++) {
        var f2 = grp2.f[j2];
        jsonObj['cim:' + grp2.c + '.' + f2[0]] = jsonLdVal(f2, className);
      }
    }

    return {
      turtle: ttlLines.join('\n'),
      jsonld: JSON.stringify(jsonObj, null, 2),
      totalProps: totalProps,
      activeClasses: groups.length,
    };
  }

  function makeCopyButton(getText) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cim-sb-copy';
    btn.textContent = 'Copy';
    btn.addEventListener('click', function () {
      var text = getText();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          btn.textContent = 'Copied';
          setTimeout(function () {
            btn.textContent = 'Copy';
          }, 1500);
        });
      }
    });
    return btn;
  }

  function initBuilder(container) {
    var dataEl = container.querySelector('script.cim-snippet-data');
    if (!dataEl) return;

    var layers;
    try {
      layers = JSON.parse(dataEl.textContent || '[]');
    } catch (err) {
      return;
    }

    var className = container.getAttribute('data-class') || '';
    var iri = container.getAttribute('data-iri') || CIM_NS + className;
    var baseClass = container.getAttribute('data-base') || '';

    var selectedSet = new Set(
      layers.map(function (l) {
        return l.c;
      })
    );
    var includeObjects = true;
    var sparseMode = false;

    var ui = document.createElement('div');
    ui.className = 'cim-sb-root';

    // Controls header: presets + object association toggle
    var toolbar = document.createElement('div');
    toolbar.className = 'cim-sb-toolbar';

    var presetGroup = document.createElement('div');
    presetGroup.className = 'cim-sb-presets';

    var btnFull = document.createElement('button');
    btnFull.type = 'button';
    btnFull.className = 'cim-sb-btn';
    btnFull.textContent = 'Full Model (All Ancestors)';

    var btnDirect = document.createElement('button');
    btnDirect.type = 'button';
    btnDirect.className = 'cim-sb-btn';
    btnDirect.textContent = 'Direct Only';

    var btnSparse = document.createElement('button');
    btnSparse.type = 'button';
    btnSparse.className = 'cim-sb-btn';
    btnSparse.textContent = 'Sparse (Minimal)';

    presetGroup.appendChild(btnFull);
    presetGroup.appendChild(btnDirect);
    presetGroup.appendChild(btnSparse);

    var objLabel = document.createElement('label');
    objLabel.className = 'cim-sb-obj-toggle';
    var objCheckbox = document.createElement('input');
    objCheckbox.type = 'checkbox';
    objCheckbox.checked = true;
    objLabel.appendChild(objCheckbox);
    objLabel.appendChild(document.createTextNode(' Include object associations'));

    toolbar.appendChild(presetGroup);
    toolbar.appendChild(objLabel);
    ui.appendChild(toolbar);

    // Per-class inheritance toggles
    var pillsWrap = document.createElement('div');
    pillsWrap.className = 'cim-sb-pills';
    var checkboxesByClass = new Map();

    for (var i = 0; i < layers.length; i++) {
      (function (layer) {
        var pill = document.createElement('label');
        pill.className = 'cim-sb-pill' + (layer.c === className ? ' cim-sb-pill-self' : '');
        var cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = true;
        cb.addEventListener('change', function () {
          sparseMode = false;
          if (cb.checked) selectedSet.add(layer.c);
          else selectedSet.delete(layer.c);
          render();
        });
        checkboxesByClass.set(layer.c, cb);

        var nameSpan = document.createElement('span');
        nameSpan.textContent = layer.c;
        var countSpan = document.createElement('span');
        countSpan.className = 'cim-sb-count';
        countSpan.textContent = String(layer.f.length);

        pill.appendChild(cb);
        pill.appendChild(nameSpan);
        pill.appendChild(countSpan);
        pillsWrap.appendChild(pill);
      })(layers[i]);
    }
    if (layers.length > 0) {
      ui.appendChild(pillsWrap);
    }

    // Status line
    var status = document.createElement('div');
    status.className = 'cim-sb-status';
    ui.appendChild(status);

    // Code blocks: Turtle + JSON-LD
    var currentTurtle = '';
    var currentJsonLd = '';

    function makeCodePanel(title, langClass, getText) {
      var panel = document.createElement('div');
      panel.className = 'cim-sb-panel';
      var head = document.createElement('div');
      head.className = 'cim-sb-panel-head';
      var titleEl = document.createElement('span');
      titleEl.textContent = title;
      head.appendChild(titleEl);
      head.appendChild(makeCopyButton(getText));
      var pre = document.createElement('pre');
      pre.className = 'cim-sb-pre';
      var code = document.createElement('code');
      code.className = langClass;
      pre.appendChild(code);
      panel.appendChild(head);
      panel.appendChild(pre);
      return { panel: panel, code: code };
    }

    var ttlPanel = makeCodePanel('Turtle (RDF Instance)', 'language-turtle', function () {
      return currentTurtle;
    });
    var jsonPanel = makeCodePanel('JSON-LD 1.1 (Instance)', 'language-json', function () {
      return currentJsonLd;
    });

    ui.appendChild(ttlPanel.panel);
    ui.appendChild(jsonPanel.panel);

    // Collapsible OWL Class Declaration (schema level)
    var details = document.createElement('details');
    details.className = 'cim-sb-owl-details';
    var summary = document.createElement('summary');
    summary.textContent = 'OWL 2 Class Declaration (Schema)';
    var owlPre = document.createElement('pre');
    owlPre.className = 'cim-sb-pre';
    var owlCode = document.createElement('code');
    var baseLine = baseClass ? ' ;\n    rdfs:subClassOf cim:' + baseClass : '';
    owlCode.textContent =
      '@prefix cim: <' +
      CIM_NS +
      '> .\n@prefix owl: <http://www.w3.org/2002/07/owl#> .\n@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .\n\ncim:' +
      className +
      ' a owl:Class' +
      baseLine +
      ' .';
    owlPre.appendChild(owlCode);
    details.appendChild(summary);
    details.appendChild(owlPre);
    ui.appendChild(details);

    function syncCheckboxes() {
      checkboxesByClass.forEach(function (cb, cname) {
        cb.checked = !sparseMode && selectedSet.has(cname);
      });
      objCheckbox.disabled = sparseMode;
      btnFull.classList.toggle(
        'is-active',
        !sparseMode && selectedSet.size === layers.length && layers.length > 0
      );
      btnDirect.classList.toggle(
        'is-active',
        !sparseMode && selectedSet.size === 1 && selectedSet.has(className)
      );
      btnSparse.classList.toggle('is-active', sparseMode);
    }

    function render() {
      syncCheckboxes();
      var res = buildSnippets(className, iri, layers, selectedSet, includeObjects, sparseMode);
      currentTurtle = res.turtle;
      currentJsonLd = res.jsonld;
      ttlPanel.code.textContent = currentTurtle;
      jsonPanel.code.textContent = currentJsonLd;
      if (sparseMode) {
        status.textContent =
          'Sparse mode: showing minimal identity fields (' +
          res.totalProps +
          ' properties). Valid under open-world CIM.';
      } else {
        status.textContent =
          'Showing ' +
          res.totalProps +
          ' properties from ' +
          res.activeClasses +
          ' of ' +
          layers.length +
          ' class(es) in the inheritance chain.';
      }
    }

    btnFull.addEventListener('click', function () {
      sparseMode = false;
      selectedSet = new Set(
        layers.map(function (l) {
          return l.c;
        })
      );
      render();
    });

    btnDirect.addEventListener('click', function () {
      sparseMode = false;
      selectedSet = new Set([className]);
      render();
    });

    btnSparse.addEventListener('click', function () {
      sparseMode = true;
      render();
    });

    objCheckbox.addEventListener('change', function () {
      includeObjects = objCheckbox.checked;
      render();
    });

    container.appendChild(ui);
    render();
  }

  function initAll() {
    var builders = document.querySelectorAll('.cim-snippet-builder');
    for (var i = 0; i < builders.length; i++) {
      initBuilder(builders[i]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
