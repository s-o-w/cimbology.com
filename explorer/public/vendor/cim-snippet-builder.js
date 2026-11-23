(function () {
  var CIM_NS = 'http://iec.ch/TC57/CIM100#';
  var XSD_NS = 'http://www.w3.org/2001/XMLSchema#';
  var DEMO_UUID = '00000000-0000-0000-0000-000000000000';

  function escXml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatSize(text) {
    var lines = text.split('\n').length;
    var bytes = new Blob([text]).size;
    var kb = bytes >= 1024 ? (bytes / 1024).toFixed(1) + ' KB' : bytes + ' B';
    return lines + ' lines \u00b7 ' + kb;
  }

  function resolveFieldValue(field, className, refCounters, refNodes) {
    var kind = field[1];
    var extra = field[2] || '';
    switch (kind) {
      case 'mrid':
        return {
          ttl: '"' + DEMO_UUID + '"',
          ttlComment: '',
          usesXsd: false,
          json: DEMO_UUID,
          xmlText: DEMO_UUID,
          xmlDatatype: '',
          xmlResource: '',
        };
      case 'name':
        return {
          ttl: '"Example ' + className + '"',
          ttlComment: '',
          usesXsd: false,
          json: 'Example ' + className,
          xmlText: 'Example ' + className,
          xmlDatatype: '',
          xmlResource: '',
        };
      case 's':
        return {
          ttl: '"example"',
          ttlComment: extra ? extra : '',
          usesXsd: false,
          json: 'example',
          xmlText: 'example',
          xmlDatatype: '',
          xmlResource: '',
        };
      case 'b':
        return {
          ttl: 'false',
          ttlComment: '',
          usesXsd: false,
          json: false,
          xmlText: 'false',
          xmlDatatype: XSD_NS + 'boolean',
          xmlResource: '',
        };
      case 'i':
        return {
          ttl: '1',
          ttlComment: extra ? extra : '',
          usesXsd: false,
          json: 1,
          xmlText: '1',
          xmlDatatype: XSD_NS + 'integer',
          xmlResource: '',
        };
      case 'f':
        return {
          ttl: '0.0',
          ttlComment: extra,
          usesXsd: false,
          json: 0.0,
          xmlText: '0.0',
          xmlDatatype: XSD_NS + 'float',
          xmlResource: '',
        };
      case 'dt':
        return {
          ttl: '"2026-01-01T00:00:00Z"^^xsd:dateTime',
          ttlComment: '',
          usesXsd: true,
          json: '2026-01-01T00:00:00Z',
          xmlText: '2026-01-01T00:00:00Z',
          xmlDatatype: XSD_NS + 'dateTime',
          xmlResource: '',
        };
      case 'd':
        return {
          ttl: '"2026-01-01"^^xsd:date',
          ttlComment: '',
          usesXsd: true,
          json: '2026-01-01',
          xmlText: '2026-01-01',
          xmlDatatype: XSD_NS + 'date',
          xmlResource: '',
        };
      case 't':
        return {
          ttl: '"12:00:00Z"^^xsd:time',
          ttlComment: '',
          usesXsd: true,
          json: '12:00:00Z',
          xmlText: '12:00:00Z',
          xmlDatatype: XSD_NS + 'time',
          xmlResource: '',
        };
      case 'dur':
        return {
          ttl: '"PT1H"^^xsd:duration',
          ttlComment: '',
          usesXsd: true,
          json: 'PT1H',
          xmlText: 'PT1H',
          xmlDatatype: XSD_NS + 'duration',
          xmlResource: '',
        };
      case 'md':
        return {
          ttl: '"--01-01"^^xsd:gMonthDay',
          ttlComment: '',
          usesXsd: true,
          json: '--01-01',
          xmlText: '--01-01',
          xmlDatatype: XSD_NS + 'gMonthDay',
          xmlResource: '',
        };
      case 'e': {
        var enumCurie = extra ? 'cim:' + extra : 'cim:EnumValue';
        var enumIri = CIM_NS + (extra || 'EnumValue');
        return {
          ttl: enumCurie,
          ttlComment: '',
          usesXsd: false,
          json: { '@id': enumCurie },
          xmlText: '',
          xmlDatatype: '',
          xmlResource: enumIri,
        };
      }
      case 'o': {
        var targetType = extra || 'Resource';
        var count = (refCounters[targetType] || 0) + 1;
        refCounters[targetType] = count;
        var refUrn = 'urn:example:' + targetType + '-' + count;
        refNodes.push({ id: refUrn, type: targetType });
        return {
          ttl: '<' + refUrn + '>',
          ttlComment: 'object ref -> cim:' + targetType,
          usesXsd: false,
          json: { '@id': refUrn },
          xmlText: '',
          xmlDatatype: '',
          xmlResource: refUrn,
        };
      }
      default:
        return {
          ttl: '"example"',
          ttlComment: '',
          usesXsd: false,
          json: 'example',
          xmlText: 'example',
          xmlDatatype: '',
          xmlResource: '',
        };
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

    var refCounters = {};
    var refNodes = [];
    var usesXsd = false;
    var stmtEntries = [];

    var mainJsonNode = {
      '@id': 'urn:uuid:' + DEMO_UUID,
      '@type': iri,
    };

    var xmlPropLines = [];

    for (var g = 0; g < groups.length; g++) {
      var grp = groups[g];
      var isSelf = grp.c === className;
      var headerText = isSelf
        ? 'Direct properties on cim:' + grp.c
        : 'Inherited from cim:' + grp.c;

      stmtEntries.push({ isComment: true, text: '    # ' + headerText });
      xmlPropLines.push('    <!-- ' + escXml(headerText) + ' -->');

      for (var j = 0; j < grp.f.length; j++) {
        var field = grp.f[j];
        var propLocal = grp.c + '.' + field[0];
        var propCurie = 'cim:' + propLocal;
        var val = resolveFieldValue(field, className, refCounters, refNodes);
        if (val.usesXsd) usesXsd = true;

        stmtEntries.push({
          isComment: false,
          pred: propCurie,
          val: val.ttl,
          comment: val.ttlComment,
        });

        mainJsonNode[propCurie] = val.json;

        if (val.xmlResource) {
          xmlPropLines.push(
            '    <' + propCurie + ' rdf:resource="' + escXml(val.xmlResource) + '"/>'
          );
        } else if (val.xmlDatatype) {
          xmlPropLines.push(
            '    <' +
              propCurie +
              ' rdf:datatype="' +
              escXml(val.xmlDatatype) +
              '">' +
              escXml(val.xmlText) +
              '</' +
              propCurie +
              '>'
          );
        } else {
          xmlPropLines.push(
            '    <' + propCurie + '>' + escXml(val.xmlText) + '</' + propCurie + '>'
          );
        }
      }
    }

    // 1. JSON-LD 1.1 (Flat @graph with pointer references and external typed nodes)
    var graphArray = [mainJsonNode];
    for (var r1 = 0; r1 < refNodes.length; r1++) {
      graphArray.push({
        '@id': refNodes[r1].id,
        '@type': CIM_NS + refNodes[r1].type,
      });
    }
    var jsonLdDoc = {
      '@context': {
        cim: CIM_NS,
      },
      '@graph': graphArray,
    };

    // 2. Turtle (RDF Instance + referenced object type triples)
    var ttlLines = ['@prefix cim: <' + CIM_NS + '> .'];
    if (usesXsd) {
      ttlLines.push('@prefix xsd: <' + XSD_NS + '> .');
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

    if (refNodes.length > 0) {
      ttlLines.push('');
      ttlLines.push('# Referenced CIM objects (kept flat as separate typed nodes)');
      for (var r2 = 0; r2 < refNodes.length; r2++) {
        ttlLines.push('<' + refNodes[r2].id + '> a cim:' + refNodes[r2].type + ' .');
      }
    }

    // 3. RDF/XML (IEC 61970-552 / CIMXML style)
    var xmlLines = [
      '<?xml version="1.0" encoding="utf-8"?>',
      '<rdf:RDF',
      '    xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"',
      '    xmlns:cim="' + CIM_NS + '">',
    ];
    if (xmlPropLines.length === 0) {
      xmlLines.push('  <cim:' + className + ' rdf:about="urn:uuid:' + DEMO_UUID + '"/>');
    } else {
      xmlLines.push('  <cim:' + className + ' rdf:about="urn:uuid:' + DEMO_UUID + '">');
      for (var x = 0; x < xmlPropLines.length; x++) {
        xmlLines.push(xmlPropLines[x]);
      }
      xmlLines.push('  </cim:' + className + '>');
    }
    if (refNodes.length > 0) {
      xmlLines.push('');
      xmlLines.push('  <!-- Referenced CIM objects (separate typed descriptions) -->');
      for (var r3 = 0; r3 < refNodes.length; r3++) {
        xmlLines.push(
          '  <cim:' + refNodes[r3].type + ' rdf:about="' + escXml(refNodes[r3].id) + '"/>'
        );
      }
    }
    xmlLines.push('</rdf:RDF>');

    return {
      jsonld: JSON.stringify(jsonLdDoc, null, 2),
      turtle: ttlLines.join('\n'),
      rdfxml: xmlLines.join('\n'),
      totalProps: totalProps,
      activeClasses: groups.length,
      refCount: refNodes.length,
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
    var activeFormat = 'all';

    var ui = document.createElement('div');
    ui.className = 'cim-sb-root';

    // Row 1: Presets + Object association toggle
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
    objLabel.appendChild(document.createTextNode(' Include object references (lifted to flat @graph)'));

    toolbar.appendChild(presetGroup);
    toolbar.appendChild(objLabel);
    ui.appendChild(toolbar);

    // Row 2: Per-class inheritance toggles
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

    // Row 3: Format filter + status
    var formatBar = document.createElement('div');
    formatBar.className = 'cim-sb-formatbar';

    var fmtGroup = document.createElement('div');
    fmtGroup.className = 'cim-sb-presets';
    var formatDefs = [
      { id: 'all', label: 'All 3 Formats' },
      { id: 'jsonld', label: 'JSON-LD 1.1' },
      { id: 'turtle', label: 'Turtle' },
      { id: 'rdfxml', label: 'RDF/XML' },
    ];
    var fmtButtons = {};
    for (var fi = 0; fi < formatDefs.length; fi++) {
      (function (def) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'cim-sb-btn cim-sb-fmt-btn';
        b.textContent = def.label;
        b.addEventListener('click', function () {
          activeFormat = def.id;
          syncVisibility();
        });
        fmtButtons[def.id] = b;
        fmtGroup.appendChild(b);
      })(formatDefs[fi]);
    }

    var status = document.createElement('div');
    status.className = 'cim-sb-status';

    formatBar.appendChild(fmtGroup);
    formatBar.appendChild(status);
    ui.appendChild(formatBar);

    // Code panels: JSON-LD 1.1 (Flat @graph), Turtle, RDF/XML
    var currentJsonLd = '';
    var currentTurtle = '';
    var currentRdfXml = '';

    function makeCodePanel(title, langClass, getText) {
      var panel = document.createElement('div');
      panel.className = 'cim-sb-panel';
      var head = document.createElement('div');
      head.className = 'cim-sb-panel-head';
      var left = document.createElement('div');
      left.className = 'cim-sb-panel-title';
      var titleEl = document.createElement('span');
      titleEl.textContent = title;
      var metaEl = document.createElement('span');
      metaEl.className = 'cim-sb-meta';
      left.appendChild(titleEl);
      left.appendChild(metaEl);
      head.appendChild(left);
      head.appendChild(makeCopyButton(getText));
      var pre = document.createElement('pre');
      pre.className = 'cim-sb-pre';
      var code = document.createElement('code');
      code.className = langClass;
      pre.appendChild(code);
      panel.appendChild(head);
      panel.appendChild(pre);
      return { panel: panel, code: code, meta: metaEl };
    }

    var jsonPanel = makeCodePanel('JSON-LD 1.1 (Flat @graph)', 'language-json', function () {
      return currentJsonLd;
    });
    var ttlPanel = makeCodePanel('Turtle (RDF 1.1)', 'language-turtle', function () {
      return currentTurtle;
    });
    var xmlPanel = makeCodePanel('RDF/XML (CIMXML / IEC 61970-552)', 'language-xml', function () {
      return currentRdfXml;
    });

    ui.appendChild(jsonPanel.panel);
    ui.appendChild(ttlPanel.panel);
    ui.appendChild(xmlPanel.panel);

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

    function syncVisibility() {
      for (var key in fmtButtons) {
        fmtButtons[key].classList.toggle('is-active', activeFormat === key);
      }
      jsonPanel.panel.style.display = activeFormat === 'all' || activeFormat === 'jsonld' ? '' : 'none';
      ttlPanel.panel.style.display = activeFormat === 'all' || activeFormat === 'turtle' ? '' : 'none';
      xmlPanel.panel.style.display = activeFormat === 'all' || activeFormat === 'rdfxml' ? '' : 'none';
    }

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
      syncVisibility();
      var res = buildSnippets(className, iri, layers, selectedSet, includeObjects, sparseMode);
      currentJsonLd = res.jsonld;
      currentTurtle = res.turtle;
      currentRdfXml = res.rdfxml;

      jsonPanel.code.textContent = currentJsonLd;
      ttlPanel.code.textContent = currentTurtle;
      xmlPanel.code.textContent = currentRdfXml;

      jsonPanel.meta.textContent = formatSize(currentJsonLd);
      ttlPanel.meta.textContent = formatSize(currentTurtle);
      xmlPanel.meta.textContent = formatSize(currentRdfXml);

      if (sparseMode) {
        status.textContent =
          'Sparse mode: minimal identity fields (' +
          res.totalProps +
          ' properties). Valid under open-world CIM.';
      } else {
        var refText =
          res.refCount > 0
            ? ' (' + res.refCount + ' referenced object(s) lifted to flat @graph)'
            : '';
        status.textContent =
          res.totalProps +
          ' properties from ' +
          res.activeClasses +
          ' of ' +
          layers.length +
          ' class(es)' +
          refText +
          '.';
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
