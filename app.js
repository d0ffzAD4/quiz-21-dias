/* Motor do quiz: renderiza window.QUIZ_FUNNEL usando window.QUIZ_CONFIG. Sem dependências. */
(function () {
  'use strict';

  var F = window.QUIZ_FUNNEL;
  var CFG = window.QUIZ_CONFIG || {};
  var steps = F.steps;
  var nav = F.navigation || {};
  var answers = {};      // nome da variável -> valor
  var selected = {};     // id da camada de opções -> [ids das opções marcadas]
  var history = [];
  var current = -1;
  var timers = [];
  var app = document.getElementById('app');

  /* ---------- utilidades ---------- */

  function h(tag, cls, html) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (html != null) el.innerHTML = html;
    return el;
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function varValue(name) {
    if (Object.prototype.hasOwnProperty.call(answers, name)) return answers[name];
    if (Object.prototype.hasOwnProperty.call(CFG, name)) return CFG[name];
    return null;
  }

  // Avalia calc(...) com parênteses balanceados; só aceita aritmética.
  function evalCalc(str) {
    var out = '', i = 0;
    while (i < str.length) {
      var k = str.indexOf('calc(', i);
      if (k < 0) { out += str.slice(i); break; }
      out += str.slice(i, k);
      var depth = 0, j = k + 4;
      for (; j < str.length; j++) {
        if (str[j] === '(') depth++;
        else if (str[j] === ')') { depth--; if (depth === 0) break; }
      }
      var expr = str.slice(k + 5, j);
      var val = '';
      if (/^[\d\s.+\-*/()]+$/.test(expr)) {
        try {
          var n = Function('"use strict";return (' + expr + ')')();
          if (isFinite(n)) val = String(Math.round(n * 10) / 10).replace('.', ',');
        } catch (e) { /* expressão inválida */ }
      }
      out += val;
      i = j + 1;
    }
    return out;
  }

  // Substitui {{variavel}}. raw=true devolve números sem escapar (para calc).
  function interp(str, raw) {
    if (str == null) return '';
    var s = String(str).replace(/\{\{\s*([\w.-]+)\s*\}\}/g, function (_, name) {
      var v = varValue(name);
      if (v == null) return raw ? '0' : '';
      return raw ? String(v) : esc(v);
    });
    return s.indexOf('calc(') >= 0 ? evalCalc(s) : s;
  }

  function num(v) {
    var n = parseFloat(String(v).replace(',', '.'));
    return isNaN(n) ? null : n;
  }

  function checkRoles(roles) {
    if (!roles || !roles.length) return true;
    // grupos em OU; condições dentro do grupo em E
    return roles.some(function (group) {
      return group.every(function (r) {
        if (!r || r.variable == null) return true;
        var left = interp(r.variable, true);
        var a = num(left), b = num(r.value);
        switch (r.compare) {
          case '>': return a != null && b != null && a > b;
          case '<': return a != null && b != null && a < b;
          case '>=': return a != null && b != null && a >= b;
          case '<=': return a != null && b != null && a <= b;
          case '!=': return String(left) !== String(r.value);
          case 'contains': return String(left).toLowerCase().indexOf(String(r.value).toLowerCase()) >= 0;
          default: return String(left) === String(r.value);
        }
      });
    });
  }

  function imgSrc(id, image) {
    var over = CFG.imagens && CFG.imagens[id];
    if (over) return over;
    return image && image.src ? image.src : null;
  }

  function placeholder(label, w, hgt) {
    var ph = h('div', 'ph');
    if (w && hgt) ph.style.aspectRatio = w + ' / ' + hgt;
    ph.innerHTML = '<span>' + esc(label || 'Sua imagem aqui') + '</span>';
    return ph;
  }

  function mediaEl(id, image, label) {
    var src = imgSrc(id, image);
    if (src) {
      var im = h('img');
      im.src = src; im.alt = ''; im.loading = 'lazy';
      return im;
    }
    if (image && image.placeholder && CFG.mostrarPlaceholders !== false) {
      return placeholder(label, image.width, image.height);
    }
    return null;
  }

  function spacing(cls) {
    var m = /h-\[([\d.]+)rem\]/.exec(cls || '');
    return m ? m[1] + 'rem' : '1rem';
  }

  function track(event, data) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: event }, data || {}));
  }

  function checkoutUrl(url) {
    url = interp(url, true);
    if (!url || url === '#') return null;
    // repassa UTMs e demais parâmetros da página para o checkout
    try {
      var u = new URL(url, location.href);
      new URLSearchParams(location.search).forEach(function (v, k) {
        if (!u.searchParams.has(k)) u.searchParams.set(k, v);
      });
      return u.toString();
    } catch (e) { return url; }
  }

  function redirect(url) {
    var u = checkoutUrl(url);
    track('quiz_checkout', { answers: answers });
    if (u) location.href = u;
    else alert('Defina o link de checkout em quiz/config.js');
  }

  /* ---------- validação e navegação ---------- */

  var stepValidators = [];

  function stepValid() {
    return stepValidators.every(function (fn) { return fn(); });
  }

  function refreshState() {
    // botões de avançar ficam apagados até a etapa estar completa
    var ok = stepValid();
    app.querySelectorAll('.btn[data-next]').forEach(function (b) { b.classList.toggle('off', !ok); });
    // camadas condicionais (ex.: alertas de IMC)
    app.querySelectorAll('[data-roles]').forEach(function (el) {
      el.hidden = !checkRoles(JSON.parse(el.getAttribute('data-roles')));
    });
  }

  function destIndex(dest) {
    if (!dest || dest === 'next') return current + 1;
    for (var i = 0; i < steps.length; i++) if (steps[i].id === dest) return i;
    return current + 1;
  }

  function go(dest) {
    var idx = destIndex(dest);
    if (idx >= steps.length) return;
    history.push(current);
    show(idx);
  }

  function back() {
    if (!history.length) return;
    show(history.pop());
  }

  /* ---------- componentes ---------- */

  var R = {};

  R.text = function (l) {
    return h('div', 'c-text', interp(l.content.text));
  };

  R.image = function (l) {
    var m = mediaEl(l.id, l.content.image);
    if (!m) return null;
    var d = h('div', 'c-image');
    d.appendChild(m);
    return d;
  };

  R.clear = function (l) {
    var d = h('div', 'c-clear');
    d.style.height = spacing(l.content.clear);
    return d;
  };

  R.alert = function (l) {
    var style = (l.design && l.design.style) || 'light';
    return h('div', 'c-alert a-' + style, interp(l.content.text));
  };

  R.button = function (l) {
    var c = l.content, d = l.design || {};
    var b = h('button', 'btn' + (d.pulse ? ' pulse' : ''), esc(interp(c.label)));
    b.type = 'button';
    if (c.type === 'redirect') {
      b.addEventListener('click', function () { redirect(c.destination); });
    } else {
      b.setAttribute('data-next', '');
      b.addEventListener('click', function () {
        if (!stepValid()) { app.classList.add('shake'); setTimeout(function () { app.classList.remove('shake'); }, 400); return; }
        go(nav[c.id] || c.destination);
      });
    }
    if (d.fixed) { var w = h('div', 'fixed-bar'); w.appendChild(b); return w; }
    return b;
  };

  R.field = function (l) {
    var c = l.content;
    var inp = h('input', 'c-field' + (c.align === 'text-center' ? ' center' : ''));
    inp.type = c.type === 'number' ? 'number' : 'text';
    if (c.type === 'number') inp.inputMode = 'numeric';
    inp.placeholder = c.placeholder || '';
    if (answers[c.name] != null) inp.value = answers[c.name];
    inp.addEventListener('input', function () { answers[c.name] = inp.value.trim(); refreshState(); });
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { var b = app.querySelector('.btn[data-next]'); if (b) b.click(); }
    });
    // o campo de nome é obrigatório no fluxo original (é usado nas próximas telas)
    if (c.required || c.name === 'nome') stepValidators.push(function () { return !!(answers[c.name] || '').length; });
    return inp;
  };

  R.options = function (l) {
    var c = l.content, d = l.design || {};
    var multi = !!c.multiple;
    var vertical = c.orientation === 'vertical';
    var featured = d.background === 'fetured';
    var showIcon = d.icon !== 'none';
    var cols = /grid-cols-(\d)/.exec(c.cols || d.grid || '');
    var ncols = cols ? +cols[1] : 1;
    var wrap = h('div', 'c-options' + (vertical ? ' vertical' : '') + (featured ? ' featured' : '') + (ncols === 1 ? ' one-col' : ''));
    wrap.style.gridTemplateColumns = 'repeat(' + ncols + ', minmax(0,1fr))';
    var sel = selected[l.id] || (selected[l.id] = []);

    function save() {
      var labels = c.options.filter(function (o) { return sel.indexOf(o.id) >= 0; })
        .map(function (o) { return h('div', null, o.label).textContent.trim(); });
      answers[c.name] = labels.join(', ');
    }

    c.options.forEach(function (o, i) {
      var b = h('button', 'opt' + (sel.indexOf(o.id) >= 0 ? ' on' : ''));
      b.type = 'button';
      var img = o.image || {};
      var media = null;
      if (img.type === 'emoji' && img.src) media = h('span', 'emoji', esc(img.src));
      // proporção das caixas vazias das opções vem do CSS, não da imagem original
      else media = mediaEl(o.id, img && img.placeholder ? { placeholder: true } : img, 'Imagem ' + (i + 1));
      var label = h('span', 'lbl', interp(o.label));
      var icon = showIcon ? h('span', 'ico ' + (multi ? 'box' : 'radio')) : null;

      if (vertical) {
        if (media) { var mw = h('span', 'media'); mw.appendChild(media); b.appendChild(mw); }
        if (label.textContent.trim() || !media) {
          var foot = h('span', 'foot');
          if (icon) foot.appendChild(icon);
          foot.appendChild(label);
          b.appendChild(foot);
        }
      } else {
        var reverse = c.order === 'reverse';
        if (media && !reverse) { var ml = h('span', 'media side'); ml.appendChild(media); b.appendChild(ml); }
        if (icon) b.appendChild(icon);
        b.appendChild(label);
        if (media && reverse) { var mr = h('span', 'media side right'); mr.appendChild(media); b.appendChild(mr); }
      }

      b.addEventListener('click', function () {
        if (multi) {
          var k = sel.indexOf(o.id);
          if (k >= 0) sel.splice(k, 1); else sel.push(o.id);
          b.classList.toggle('on', k < 0);
          save(); refreshState();
          return;
        }
        sel.length = 0; sel.push(o.id);
        wrap.querySelectorAll('.opt').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        save(); refreshState();
        if (!c.awaitSubmit) {
          var dest = nav[o.id] || o.destination;
          setTimeout(function () { go(dest); }, 250);
        }
      });
      wrap.appendChild(b);
    });

    if (c.required) stepValidators.push(function () { return sel.length > 0; });
    return wrap;
  };

  // régua arrastável para altura/peso
  function ruler(l, kind) {
    var c = l.content;
    var metric = { min: kind === 'h' ? 90 : 25, max: kind === 'h' ? 243 : 300, unit: kind === 'h' ? 'cm' : 'kg' };
    var imperial = kind === 'h' ? { min: 35, max: 96, unit: 'pol', f: 1 / 2.54 } : { min: 55, max: 661, unit: 'lb', f: 2.20462 };
    var useImp = false;
    var PX = 10; // pixels por unidade
    if (answers[c.name] == null) answers[c.name] = c.value;

    var wrap = h('div', 'c-ruler');
    var toggle = h('div', 'units');
    var bM = h('button', 'on', metric.unit), bI = h('button', '', imperial.unit);
    bM.type = bI.type = 'button';
    toggle.appendChild(bM); toggle.appendChild(bI);
    var read = h('div', 'read');
    var scroller = h('div', 'scroller');
    var track = h('div', 'track');
    scroller.appendChild(track);
    var needle = h('div', 'needle');
    var hint = h('div', 'hint', 'Arraste para ajustar');
    wrap.appendChild(toggle); wrap.appendChild(read);
    var box = h('div', 'rbox'); box.appendChild(scroller); box.appendChild(needle);
    wrap.appendChild(box); wrap.appendChild(hint);

    function range() { return useImp ? imperial : metric; }
    function build() {
      var r = range();
      track.innerHTML = '';
      track.style.width = ((r.max - r.min) * PX) + 'px';
      for (var v = r.min; v <= r.max; v++) {
        var t = h('span', 'tick' + (v % 10 === 0 ? ' big' : v % 5 === 0 ? ' mid' : ''));
        t.style.left = ((v - r.min) * PX) + 'px';
        if (v % 10 === 0) t.appendChild(h('i', null, String(v)));
        track.appendChild(t);
      }
    }
    function display() {
      var v = answers[c.name];
      var shown = useImp ? Math.round(v * imperial.f) : v;
      read.innerHTML = '<b>' + shown + '</b><small>' + range().unit + '</small>';
      return shown;
    }
    function place() {
      var r = range();
      var shown = display();
      scroller.scrollLeft = (Math.min(r.max, Math.max(r.min, shown)) - r.min) * PX;
    }
    var raf = null;
    scroller.addEventListener('scroll', function () {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = null;
        var r = range();
        var v = Math.round(scroller.scrollLeft / PX) + r.min;
        v = Math.min(r.max, Math.max(r.min, v));
        answers[c.name] = useImp ? Math.round(v / imperial.f) : v;
        display();
        refreshState();
      });
    });
    // arrastar com o mouse (no toque o scroll nativo já resolve)
    var drag = null;
    scroller.addEventListener('mousedown', function (e) { drag = { x: e.clientX, s: scroller.scrollLeft }; e.preventDefault(); });
    window.addEventListener('mousemove', function (e) { if (drag) scroller.scrollLeft = drag.s - (e.clientX - drag.x); });
    window.addEventListener('mouseup', function () { drag = null; });

    function setUnit(imp) {
      useImp = imp;
      bM.classList.toggle('on', !imp); bI.classList.toggle('on', imp);
      build(); requestAnimationFrame(place);
    }
    bM.addEventListener('click', function () { setUnit(false); });
    bI.addEventListener('click', function () { setUnit(true); });
    build();
    requestAnimationFrame(place);
    return wrap;
  }
  R.height = function (l) { return ruler(l, 'h'); };
  R.weight = function (l) { return ruler(l, 'w'); };

  R.metric = function (l) {
    var c = l.content;
    var legends = String(c.legends || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    var pct = Math.max(0, Math.min(100, parseFloat(c.percent) || 0));
    var d = h('div', 'c-metric');
    if (c.show_title && c.title) d.appendChild(h('div', 'm-title', interp(c.title)));
    var bar = h('div', 'm-bar');
    var dot = h('div', 'm-dot');
    dot.style.left = pct + '%';
    if (c.tooltip) {
      var tip = h('div', 'm-tip', esc(interp(c.tooltip)));
      tip.style.left = pct + '%';
      d.appendChild(tip);
    }
    bar.appendChild(dot);
    d.appendChild(bar);
    var lg = h('div', 'm-leg');
    legends.forEach(function (t) { lg.appendChild(h('span', null, esc(t))); });
    d.appendChild(lg);
    return d;
  };

  R.loading = function (l) {
    var c = l.content;
    var d = h('div', 'c-loading');
    var pctEl = h('div', 'l-pct', '0%');
    var bar = h('div', 'l-bar'); var fill = h('div', 'l-fill'); bar.appendChild(fill);
    if (c.show_percent !== false) d.appendChild(pctEl);
    if (c.show_progress !== false) d.appendChild(bar);
    if (c.description) d.appendChild(h('div', 'l-desc', interp(c.description)));
    var total = (parseFloat(c.seconds) || 5) * 1000, start = Date.now();
    var iv = setInterval(function () {
      var p = Math.min(100, Math.round((Date.now() - start) / total * 100));
      pctEl.textContent = p + '%';
      fill.style.width = p + '%';
      if (p >= 100) { clearInterval(iv); timers.push(setTimeout(function () { go(c.destination); }, 400)); }
    }, 80);
    timers.push(iv);
    return d;
  };

  R.carousel = function (l) {
    var c = l.content;
    var d = h('div', 'c-carousel');
    var rail = h('div', 'rail');
    var dots = h('div', 'dots');
    c.items.forEach(function (it, i) {
      var s = h('div', 'slide');
      var m = mediaEl(it.id, it.image, 'Depoimento ' + (i + 1));
      if (m) s.appendChild(m);
      if (it.text && !/Exemplo de descrição/.test(it.text)) s.appendChild(h('div', 'cap', interp(it.text)));
      rail.appendChild(s);
      var dot = h('button', i === 0 ? 'on' : '');
      dot.type = 'button';
      dot.setAttribute('aria-label', 'Slide ' + (i + 1));
      dot.addEventListener('click', function () { to(i); });
      dots.appendChild(dot);
    });
    function to(i) {
      var s = rail.children[i];
      if (s) rail.scrollTo({ left: s.offsetLeft - (rail.clientWidth - s.clientWidth) / 2, behavior: 'smooth' });
    }
    rail.addEventListener('scroll', function () {
      var mid = rail.scrollLeft + rail.clientWidth / 2, best = 0, bd = 1e9;
      Array.prototype.forEach.call(rail.children, function (s, i) {
        var dd = Math.abs(s.offsetLeft + s.clientWidth / 2 - mid);
        if (dd < bd) { bd = dd; best = i; }
      });
      Array.prototype.forEach.call(dots.children, function (x, i) { x.classList.toggle('on', i === best); });
      d._i = best;
    });
    d.appendChild(rail);
    if (c.pagination !== false) d.appendChild(dots);
    if (c.autoplay) {
      timers.push(setInterval(function () { to(((d._i || 0) + 1) % c.items.length); }, (parseFloat(c.delay) || 5) * 1000));
    }
    return d;
  };

  R.arguments = function (l) {
    var c = l.content;
    var d = h('div', 'c-args');
    c.arguments.forEach(function (a, i) {
      var card = h('div', 'arg' + (i === c.arguments.length - 1 ? ' good' : ''));
      var m = mediaEl(a.id, a.image);
      if (m) card.appendChild(m);
      card.appendChild(h('div', 'arg-t', interp(a.text)));
      d.appendChild(card);
    });
    return d;
  };

  R.price = function (l) {
    var c = l.content;
    var d = h('div', 'c-price');
    if (c.featured) d.appendChild(h('div', 'p-feat', esc(interp(c.featured))));
    var body = h('div', 'p-body');
    body.appendChild(h('div', 'p-title', interp(c.title)));
    var right = h('div', 'p-vals');
    if (c.before) right.appendChild(h('div', 'p-before', interp(c.before)));
    right.appendChild(h('div', 'p-value', esc(interp(c.value))));
    if (c.after) right.appendChild(h('div', 'p-after', esc(interp(c.after))));
    body.appendChild(right);
    d.appendChild(body);
    if (c.redirect) {
      d.classList.add('link');
      d.addEventListener('click', function () { redirect(CFG.checkout); });
    }
    return d;
  };

  R.video = function (l) {
    var c = l.content;
    var url = CFG.videos && CFG.videos[l.id];
    var d = h('div', 'c-video');
    if (url) {
      var f = h('iframe');
      f.src = url; f.allow = 'autoplay; encrypted-media; picture-in-picture'; f.allowFullscreen = true;
      d.appendChild(f);
    } else if (c.video) {
      d.innerHTML = c.video;
    } else if (c.placeholder && CFG.mostrarPlaceholders !== false) {
      d.appendChild(placeholder('Seu vídeo aqui', 16, 9));
    } else return null;
    return d;
  };

  R.faq = function (l) {
    var c = l.content;
    var d = h('div', 'c-faq');
    c.questions.forEach(function (q, i) {
      var it = h('details', 'faq-i');
      if (i === 0 && c.firstQuestionOpened) it.open = true;
      it.appendChild(h('summary', null, esc(interp(q.question))));
      it.appendChild(h('div', 'faq-a', interp(q.answer)));
      d.appendChild(it);
    });
    return d;
  };

  /* ---------- etapa ---------- */

  function header(step, idx) {
    var o = step.options || {};
    var hd = h('header', 'top');
    var row = h('div', 'top-row');
    var bk = h('button', 'back', '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M20 11H7.8l5.6-5.6L12 4l-8 8 8 8 1.4-1.4L7.8 13H20z" fill="currentColor"/></svg>');
    bk.type = 'button';
    bk.setAttribute('aria-label', 'Voltar');
    bk.addEventListener('click', back);
    if (o.show_back === false || !history.length) bk.style.visibility = 'hidden';
    row.appendChild(bk);
    var logo = h('div', 'logo');
    if (CFG.logo) { var im = h('img'); im.src = CFG.logo; im.alt = CFG.produto || ''; logo.appendChild(im); }
    else logo.appendChild(h('span', 'logo-txt', esc(CFG.produto || '')));
    row.appendChild(logo);
    row.appendChild(h('span', 'back-sp'));
    hd.appendChild(row);
    if (o.show_progress !== false) {
      var pr = h('div', 'progress'); var f = h('div');
      f.style.width = Math.max(4, Math.round(idx / (steps.length - 1) * 100)) + '%';
      pr.appendChild(f); hd.appendChild(pr);
    }
    return hd;
  }

  function show(idx) {
    timers.forEach(function (t) { clearTimeout(t); clearInterval(t); });
    timers = [];
    stepValidators = [];
    current = idx;
    var step = steps[idx];
    app.innerHTML = '';
    var main = h('main', 'step');
    main.id = 'step_' + step.id;
    main.appendChild(header(step, idx));
    var body = h('div', 'layers');
    step.layers.forEach(function (l) {
      var fn = R[l.type];
      if (!fn) return;
      var el = fn(l);
      if (!el) return;
      var w = h('div', 'layer t-' + l.type);
      var d = l.design || {};
      if (d.basis && +d.basis < 100) w.style.flexBasis = d.basis + '%';
      else if (d.cols && +d.cols < 12) w.style.flexBasis = (d.cols / 12 * 100) + '%';
      if (d.horizontalAlign === 'mx-auto') w.classList.add('mx-auto');
      if (l.roles && l.roles.some(function (g) { return g.some(function (r) { return r && r.variable; }); })) {
        w.setAttribute('data-roles', JSON.stringify(l.roles));
      }
      w.appendChild(el);
      body.appendChild(w);
    });
    main.appendChild(body);
    if (CFG.rodape) main.appendChild(h('footer', 'foot-txt', interp(CFG.rodape)));
    app.appendChild(main);
    refreshState();
    window.scrollTo(0, 0);
    track('quiz_step', { step_index: idx, step_id: step.id, step_title: step.title });
  }

  /* ---------- início ---------- */

  var root = document.documentElement.style;
  var D = F.design || {};
  root.setProperty('--theme', CFG.corTema || D.themeColor || '#f59e0b');
  root.setProperty('--title', D.titleColor || '#030712');
  root.setProperty('--content', D.contentColor || '#6b7280');
  root.setProperty('--bg', D.backgroundColor || '#ffffff');
  document.title = CFG.produto || document.title;

  if (CFG.gtm) {
    (function (w, d, s, l, i) {
      w[l] = w[l] || []; w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
      var f = d.getElementsByTagName(s)[0], j = d.createElement(s);
      j.async = true; j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i;
      f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', CFG.gtm);
  }

  // ?etapa=N abre direto numa etapa (útil para revisar o layout)
  var start = parseInt(new URLSearchParams(location.search).get('etapa'), 10);
  show(start >= 0 && start < steps.length ? start : 0);
})();
