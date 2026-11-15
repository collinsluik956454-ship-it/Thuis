/* Thuis – gezinsapp: weekrooster, klusjes met sterren, beloningen, spaarpot, uitgaven en prikbord. */
(function () {
  "use strict";

  var NATIVE = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  function plug(n) { return NATIVE && window.Capacitor.Plugins ? window.Capacitor.Plugins[n] : null; }
  function lsGet(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function lsSet(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  var app = document.getElementById("app");
  var sheetEl = document.getElementById("sheet");
  var toastEl = document.getElementById("toast");

  var V = { who: lsGet("thuis.who", null), tab: "home", ktab: "klus", week: 0, geld: "pot", month: "", gate: "welkom", acc: "nieuw", email: "", pop: "" };

  /* ---------- vaste lijsten ---------- */
  var COLORS = ["#f6c453", "#f28b82", "#7fc8a9", "#8ab4f8", "#c58af9", "#f9a65a", "#78d6e0", "#f48fb1"];
  var EM_P = ["🦁", "🐻", "🐼", "🦊", "🐰", "🐸", "🐵", "🦄", "🐶", "🐱", "🐯", "🐨", "🐷", "🐙", "🦋", "🐝", "🦖", "🐢", "🐬", "🦉", "👩", "👨", "🧑", "👵", "👴"];
  var EM_T = ["🪥", "🛏️", "🧸", "🍽️", "🧹", "🧺", "👕", "🗑️", "🐶", "🐱", "🪴", "📚", "✏️", "🎒", "🚿", "🛁", "🧦", "🥣", "🍎", "🚲", "🎹", "⚽", "🧼", "🧽", "📦", "♻️", "🛒", "💤", "👟", "🧥", "🎨", "🧩", "🦷", "🙏"];
  var EM_R = ["📖", "🍦", "🎲", "🌙", "🛝", "🎬", "🍿", "🍕", "🎮", "🧁", "🍭", "🎁", "🎈", "🦖", "🧸", "⚽", "🎨", "🏕️", "🏊", "🚲", "🛴", "🦄", "🎧", "🏰"];
  var EM_D = ["🎂", "🎉", "🏫", "⚽", "🩺", "🦷", "✈️", "🎄", "🎃", "🐣", "🎁", "⭐", "📅", "🏖️", "🎭", "🎵"];
  var EM_M = ["📌", "💬", "❤️", "⚠️", "🛒", "📞", "🍽️", "🎒", "🧺", "💡"];
  var NOTES = ["#fff1a8", "#ffd9cf", "#d3f0dc", "#d7e6ff", "#eadcff"];
  var CATS = [["kleding", "👕", "Kleding"], ["school", "🎒", "School"], ["sport", "⚽", "Sport & clubs"], ["opvang", "🏫", "Opvang"], ["uitjes", "🎡", "Uitjes"], ["speelgoed", "🧸", "Speelgoed"], ["zorg", "🩺", "Zorg"], ["eten", "🍎", "Eten"], ["overig", "📦", "Overig"]];
  var PARTS = [["ochtend", "☀️", "Ochtend"], ["middag", "🌤️", "Middag"], ["avond", "🌙", "Avond"], ["", "📋", "Hele dag"]];
  var DAGEN = ["", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag"];
  var DK = ["", "ma", "di", "wo", "do", "vr", "za", "zo"];
  var MND = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"];
  var MNDK = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
  var RULES = '{\n  "rules": {\n    "families": {\n      "$uid": {\n        ".read": "auth != null && auth.uid === $uid",\n        ".write": "auth != null && auth.uid === $uid"\n      }\n    }\n  }\n}';

  var IC = {
    home: '<path d="M3.5 11 12 4l8.5 7v9a1 1 0 0 1-1 1H15v-6H9v6H4.5a1 1 0 0 1-1-1z"/>',
    cal: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    star: '<path d="m12 3.5 2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.8l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/>',
    coin: '<circle cx="12" cy="12" r="8.5"/><path d="M14.8 9.2a3.4 3.4 0 1 0 0 5.6M8 11h5.5M8 13.2h5.5"/>',
    pin: '<path d="M12 21s-6.5-5.7-6.5-11a6.5 6.5 0 0 1 13 0c0 5.3-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    users: '<path d="M16 20v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V20"/><circle cx="9" cy="7.5" r="3.5"/><path d="M22 20v-1.5a4 4 0 0 0-3-3.9M15.5 4.1a3.5 3.5 0 0 1 0 6.8"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    chevL: '<path d="m15 6-6 6 6 6"/>',
    chevR: '<path d="m9 6 6 6-6 6"/>',
    speak: '<path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z"/><path d="M15.5 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    x: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
    back: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
    share: '<circle cx="18" cy="5.5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="18.5" r="2.5"/><path d="m8.2 10.8 7.6-4.1M8.2 13.2l7.6 4.1"/>'
  };
  function ic(n, s) { return '<svg width="' + (s || 22) + '" height="' + (s || 22) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + IC[n] + "</svg>"; }
  var LOGO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.2 12 3.6l9 7.6v8.9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" fill="#fff"/><path d="m12 9.6 1.35 2.75 3.03.44-2.19 2.14.52 3.02L12 16.52l-2.71 1.43.52-3.02-2.19-2.14 3.03-.44z" fill="var(--acc-on)"/></svg>';

  /* ---------- kleine hulpjes ---------- */
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function obj(x) { return x && typeof x === "object" ? x : {}; }
  function arr(x) { if (Array.isArray(x)) return x.filter(function (v) { return v != null; }); if (x && typeof x === "object") return Object.keys(x).map(function (k) { return x[k]; }); return []; }
  function list(x) { x = obj(x); return Object.keys(x).filter(function (k) { return x[k] && typeof x[k] === "object"; }).map(function (k) { return Object.assign({}, x[k], { id: k }); }); }
  function int(v, d) { var n = parseInt(v, 10); return isFinite(n) ? n : (d || 0); }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function ymd(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function pd(s) { var a = String(s).split("-"); return new Date(+a[0], (+a[1] || 1) - 1, +a[2] || 1); }
  function today() { return ymd(new Date()); }
  function addD(s, n) { var d = pd(s); d.setDate(d.getDate() + n); return ymd(d); }
  function diffD(a, b) { return Math.round((pd(b) - pd(a)) / 864e5); }
  function isoDay(s) { var g = pd(s).getDay(); return g === 0 ? 7 : g; }
  function monday(s) { return addD(s, 1 - isoDay(s)); }
  function weekKey(s) {
    var d = pd(s); d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    var j = new Date(d.getFullYear(), 0, 1);
    return d.getFullYear() + "-W" + pad(Math.floor(Math.round((d - j) / 864e5) / 7) + 1);
  }
  function fmtShort(s) { var d = pd(s); return d.getDate() + " " + MNDK[d.getMonth()]; }
  function fmtLong(s) { var d = pd(s); return DAGEN[isoDay(s)] + " " + d.getDate() + " " + MND[d.getMonth()]; }
  function fmtMonth(mk) { var a = mk.split("-"); return MND[+a[1] - 1] + " " + a[0]; }
  function addMonth(mk, n) { var a = mk.split("-"); var d = new Date(+a[0], +a[1] - 1 + n, 1); return d.getFullYear() + "-" + pad(d.getMonth() + 1); }
  function ago(t) {
    var m = Math.round((Date.now() - (t || 0)) / 60000);
    if (m < 2) return "zojuist"; if (m < 60) return m + " min geleden";
    var h = Math.round(m / 60); if (h < 24) return h + " uur geleden";
    var d = Math.round(h / 24); return d === 1 ? "gisteren" : d + " dagen geleden";
  }
  var EUR = new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" });
  function euro(c) { return EUR.format((c || 0) / 100); }
  function cents(str) {
    str = String(str == null ? "" : str).trim().replace(/[\s€]/g, "");
    if (!str) return NaN;
    if (str.indexOf(",") >= 0) str = str.replace(/\./g, "").replace(",", ".");
    var v = parseFloat(str);
    return isFinite(v) ? Math.round(v * 100) : NaN;
  }
  function moneyVal(c) { return c ? (c / 100).toFixed(2).replace(".", ",") : ""; }
  function inText(n) { return n === 0 ? "Vandaag" : n === 1 ? "Morgen" : "Over " + n + " dagen"; }
  function nights(n) { return n === 0 ? "Vandaag! 🎉" : n === 1 ? "Nog 1 nachtje slapen" : "Nog " + n + " nachtjes slapen"; }

  /* ---------- gegevens ---------- */
  function D() { return Store.data || {}; }
  function cfg() { return obj(D().settings); }
  function profs() { return list(D().profiles).filter(function (p) { return p.name; }).sort(function (a, b) { return (a.order || 0) - (b.order || 0) || String(a.name).localeCompare(b.name); }); }
  function kids() { return profs().filter(function (p) { return p.role === "kind"; }); }
  function parents() { return profs().filter(function (p) { return p.role !== "kind"; }); }
  function P(id) { var p = obj(D().profiles)[id]; return p && p.name ? Object.assign({}, p, { id: id }) : null; }
  function me() { return V.who ? P(V.who) : null; }
  function approveOn() { return cfg().approve !== false; }
  function rate() { return cfg().rate > 0 ? +cfg().rate : 10; }
  function tasks() { return list(D().tasks).filter(function (t) { return t.title; }).sort(function (a, b) { return (a.at || 0) - (b.at || 0); }); }
  function sum(o, f) { var s = 0; o = obj(o); for (var k in o) s += +(o[k] && o[k][f]) || 0; return s; }
  function starBal(pid) { return sum(obj(D().stars)[pid], "n"); }
  function potBal(pid) { return sum(obj(D().pot)[pid], "c"); }
  function reqs(pid) { return list(D().reqs).filter(function (r) { return !pid || r.pid === pid; }).sort(function (a, b) { return (a.at || 0) - (b.at || 0); }); }
  function doneOf(ds, tid, pid) { return obj(obj(D().done)[ds])[tid + "_" + pid] || null; }
  function bossName() { var ps = parents().map(function (p) { return p.name; }); return ps.length ? ps.join(" of ") : "papa of mama"; }

  function taskOn(t, ds) {
    if (t.once) return t.once === ds;
    if (t.start && ds < t.start) return false;
    var days = arr(t.days);
    return !days.length || days.indexOf(isoDay(ds)) >= 0;
  }
  function occurrences(t, from, ds) {
    var days = arr(t.days); if (!days.length) days = [1, 2, 3, 4, 5, 6, 7];
    var diff = diffD(from, ds); if (diff < 0) return 0;
    var full = Math.floor((diff + 1) / 7), rem = (diff + 1) % 7, n = full * days.length, wd = isoDay(from);
    for (var i = 0; i < rem; i++) if (days.indexOf(((wd - 1 + i) % 7) + 1) >= 0) n++;
    return n;
  }
  function taskWho(t, ds) {
    var ppl = arr(t.people).filter(function (id) { return P(id); });
    if (!ppl.length) return [];
    if (t.mode !== "beurt" || ppl.length < 2 || t.once) return ppl;
    var start = t.start || ds, idx;
    if (t.rot === "week") idx = Math.floor(diffD(monday(start), monday(ds)) / 7);
    else idx = occurrences(t, start, ds) - 1;
    var n = ppl.length;
    return [ppl[((idx % n) + n) % n]];
  }
  var PIDX = { ochtend: 0, middag: 1, avond: 2 };
  function tasksOn(ds) {
    return tasks().filter(function (t) { return taskOn(t, ds); })
      .sort(function (a, b) { return (PIDX[a.part] != null ? PIDX[a.part] : 3) - (PIDX[b.part] != null ? PIDX[b.part] : 3) || (a.at || 0) - (b.at || 0); })
      .map(function (t) { return { t: t, who: taskWho(t, ds) }; })
      .filter(function (x) { return x.who.length; });
  }
  function schedText(t) {
    var s;
    if (t.once) s = "Eenmalig, " + fmtLong(t.once);
    else {
      var d = arr(t.days).slice().sort();
      var j = d.join(",");
      s = !d.length || d.length === 7 ? "Elke dag" : j === "1,2,3,4,5" ? "Doordeweeks" : j === "6,7" ? "Weekend" : d.map(function (x) { return DK[x]; }).join(", ");
    }
    var part = PARTS.filter(function (p) { return p[0] === (t.part || ""); })[0];
    if (t.part && part) s += " · " + part[2].toLowerCase();
    var names = arr(t.people).map(P).filter(Boolean).map(function (p) { return p.name; });
    if (names.length) s += " · " + (t.mode === "beurt" && names.length > 1 ? "om de beurt" + (t.rot === "week" ? " per week" : "") + ": " : "") + names.join(t.mode === "beurt" ? ", " : " & ");
    return s;
  }

  function nextOcc(x) {
    var t = today();
    if (!x.d) return null;
    if (!x.yearly) return x.d >= t ? x.d : null;
    var y = +t.slice(0, 4), md = x.d.slice(5);
    function mk(yy) { var leap = (yy % 4 === 0 && yy % 100 !== 0) || yy % 400 === 0; return yy + "-" + (md === "02-29" && !leap ? "02-28" : md); }
    var c = mk(y);
    return c < t ? mk(y + 1) : c;
  }
  function upcoming(days) {
    return list(D().dates).map(function (x) {
      var n = nextOcc(x); if (!n) return null;
      var age = x.yearly ? +n.slice(0, 4) - +x.d.slice(0, 4) : 0;
      return Object.assign({}, x, { next: n, inn: diffD(today(), n), age: age > 0 && age < 130 ? age : 0 });
    }).filter(function (x) { return x && x.inn <= days; }).sort(function (a, b) { return a.inn - b.inn; });
  }

  function approvals() {
    var out = [], dn = obj(D().done);
    Object.keys(dn).forEach(function (ds) {
      var day = obj(dn[ds]);
      Object.keys(day).forEach(function (k) {
        var r = day[k]; if (!r || r.st !== "wacht") return;
        var i = k.lastIndexOf("_"), tid = k.slice(0, i), pid = k.slice(i + 1);
        var t = obj(D().tasks)[tid], p = P(pid);
        if (t && t.title && p) out.push({ type: "t", ds: ds, tid: tid, pid: pid, t: Object.assign({ id: tid }, t), p: p, at: r.at || 0 });
      });
    });
    reqs().forEach(function (r) { var p = P(r.pid); if (p) out.push({ type: "r", id: r.id, r: r, p: p, at: r.at || 0 }); });
    return out.sort(function (a, b) { return a.at - b.at; });
  }

  function doneMulti(ds, tid, pid, st, m) {
    m = m || {};
    var t = obj(D().tasks)[tid], p = P(pid);
    m["done/" + ds + "/" + tid + "_" + pid] = st ? { st: st, at: Date.now(), by: V.who || "" } : null;
    m["stars/" + pid + "/t_" + ds + "_" + tid] = st === "ok" && t && t.stars > 0 && p && p.role === "kind"
      ? { n: +t.stars, why: (t.emoji ? t.emoji + " " : "") + t.title, at: Date.now() } : null;
    return m;
  }
  function approveReq(id, m) {
    var r = obj(D().reqs)[id]; if (!r) return false;
    var p = P(r.pid), bal = starBal(r.pid);
    if (m && m.__spent) bal -= m.__spent[r.pid] || 0;
    if (bal < r.cost) { toast((p ? p.name : "Dit kind") + " heeft niet genoeg sterren (⭐ " + bal + ")"); return false; }
    var own = !m; m = m || {};
    m["reqs/" + id] = null;
    m["stars/" + r.pid + "/r_" + id] = { n: -r.cost, why: (r.emoji || "🎁") + " " + r.title, at: Date.now() };
    if (m.__spent) m.__spent[r.pid] = (m.__spent[r.pid] || 0) + r.cost;
    if (own) Store.multi(m);
    return true;
  }

  /* ---------- weekgeld en opruimen (één keer per sessie) ---------- */
  var maintDone = false;
  function maint() {
    if (maintDone || !Store.ready) return;
    if (Store.mode === "cloud" && Store.status !== "online") return;
    maintDone = true;
    var m = {}, td = today();
    kids().forEach(function (k) {
      if (!(k.weekgeld > 0) || !k.wgStart) return;
      var pot = obj(obj(D().pot)[k.id]), d = monday(td);
      for (var i = 0; i < 12; i++) {
        var wk = weekKey(d);
        if (wk < k.wgStart) break;
        var id = "w_" + wk;
        if (!pot[id]) m["pot/" + k.id + "/" + id] = { c: k.weekgeld, why: "Weekgeld", at: Date.now() };
        d = addD(d, -7);
      }
    });
    var cut = addD(td, -120);
    Object.keys(obj(D().done)).forEach(function (ds) { if (ds < cut) m["done/" + ds] = null; });
    Store.multi(m);
  }

  /* ---------- voorlezen ---------- */
  function canSpeak() { return !!(plug("TextToSpeech") || ("speechSynthesis" in window && window.SpeechSynthesisUtterance)); }
  function say(text) {
    var tts = plug("TextToSpeech");
    if (tts) { tts.speak({ text: text, lang: "nl-NL", rate: 0.9 }).catch(function () {}); return; }
    if (!window.speechSynthesis) return;
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text); u.lang = "nl-NL"; u.rate = 0.9;
    var v = speechSynthesis.getVoices().filter(function (x) { return /^nl/i.test(x.lang); })[0];
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  }
  function spk(text) { return canSpeak() ? '<button class="spk" data-a="say" data-s="' + esc(text) + '" aria-label="Voorlezen">' + ic("speak", 20) + "</button>" : ""; }

  /* ---------- bouwstenen ---------- */
  function av(p, size) {
    size = size || 36;
    return '<span class="av" style="--c:' + esc(p.color || "#ccc") + ";width:" + size + "px;height:" + size + "px;font-size:" + Math.round(size * 0.56) + 'px">' + esc(p.emoji || "🙂") + "</span>";
  }
  function card(title, body, cls, action) {
    return '<section class="card ' + (cls || "") + '">' + (title ? '<div class="ch"><h2>' + title + "</h2>" + (action || "") + "</div>" : "") + body + "</section>";
  }
  function empty(text, actions) { return '<div class="empty"><p>' + text + "</p>" + (actions ? '<div class="btns">' + actions + "</div>" : "") + "</div>"; }
  function bar(frac, cls) { return '<div class="bar ' + (cls || "") + '"><i style="width:' + Math.round(clamp(frac || 0, 0, 1) * 100) + '%"></i></div>'; }
  function stepper(name, val, min, max) {
    return '<div class="step"><button type="button" data-a="step" data-n="-1" aria-label="Minder">−</button><input name="' + name + '" type="number" inputmode="numeric" min="' + min + '" max="' + max + '" value="' + val + '"><button type="button" data-a="step" data-n="1" aria-label="Meer">+</button></div>';
  }
  function emoPick(name, set, cur) {
    var inSet = set.indexOf(cur) >= 0;
    return '<div class="emo">' + set.map(function (e) {
      return '<label><input type="radio" name="' + name + '" value="' + e + '"' + (e === cur ? " checked" : "") + "><span>" + e + "</span></label>";
    }).join("") + '<label class="own"><input type="radio" name="' + name + '" value="__own"' + (!inSet && cur ? " checked" : "") + '><span><input type="text" name="' + name + 'Own" maxlength="8" placeholder="…" aria-label="Eigen emoji" value="' + (!inSet && cur ? esc(cur) : "") + '"></span></label></div>';
  }
  function emoVal(fd, name, def) {
    var v = fd.get(name);
    if (v === "__own") v = String(fd.get(name + "Own") || "").trim();
    return v || def;
  }
  function radios(name, opts, cur, cls) {
    return '<div class="pick ' + (cls || "") + '">' + opts.map(function (o) {
      return '<label><input type="radio" name="' + name + '" value="' + esc(o[0]) + '"' + (o[0] === cur ? " checked" : "") + "><span>" + o[1] + "</span></label>";
    }).join("") + "</div>";
  }
  function checks(name, opts, cur) {
    return '<div class="pick">' + opts.map(function (o) {
      return '<label><input type="checkbox" name="' + name + '" value="' + esc(o[0]) + '"' + (cur.indexOf(o[0]) >= 0 ? " checked" : "") + "><span>" + o[1] + "</span></label>";
    }).join("") + "</div>";
  }
  function colorPick(name, set, cur) {
    return '<div class="colors">' + set.map(function (c) {
      return '<label><input type="radio" name="' + name + '" value="' + c + '"' + (c === cur ? " checked" : "") + '><span style="background:' + c + '"></span></label>';
    }).join("") + "</div>";
  }
  function delBtn(a, id) { return id ? '<button type="button" class="btn danger" data-a="' + a + '" data-id="' + esc(id) + '">Verwijderen</button>' : ""; }
  function sure(el) {
    if (el.classList.contains("sure")) return true;
    var old = el.innerHTML;
    el.classList.add("sure"); el.textContent = "Zeker weten?";
    setTimeout(function () { if (el.isConnected && el.classList.contains("sure")) { el.classList.remove("sure"); el.innerHTML = old; } }, 3500);
    return false;
  }

  function statusInfo() {
    if (Store.mode === "local") return ["local", "Alleen op deze telefoon"];
    var s = Store.status, n = Store.pending;
    if (s === "online") return n ? ["busy", "Opslaan…"] : ["ok", "Gesynchroniseerd"];
    if (s === "verbinden" || !s) return ["busy", "Verbinden…"];
    if (s === "geweigerd") return ["err", "Geen toegang tot de database"];
    if (s === "afgemeld") return ["err", "Opnieuw inloggen nodig"];
    if (s === "fout") return ["err", Store.statusMsg || "Fout"];
    return ["off", "Offline" + (n ? " · " + n + " " + (n > 1 ? "wijzigingen wachten" : "wijziging wacht") : "")];
  }
  function statusHtml() { var s = statusInfo(); return '<span class="sync ' + s[0] + '"><i></i>' + esc(s[1]) + "</span>"; }

  /* ---------- weergeven ---------- */
  var rq = 0, lastGate = null;
  function schedule() { if (rq) return; rq = requestAnimationFrame(function () { rq = 0; render(); }); }
  function gateKey() {
    var m = Store.mode;
    if (!m) return "g_" + V.gate;
    if (m === "cloud" && !Store.authed) return "acc_" + V.acc + (Store.lost ? "_lost" : "");
    if (!Store.ready) {
      if (Store.status === "geweigerd") return "denied";
      if (Store.status === "fout") return "fout";
      return "loading";
    }
    if (!profs().length) return "first";
    return null;
  }
  function render(force) {
    var g = gateKey();
    if (g) {
      if (g !== lastGate || force === true) { lastGate = g; renderGate(g); }
      else if (g === "loading") { var el = document.getElementById("ldst"); if (el) el.innerHTML = statusHtml(); }
      return;
    }
    lastGate = null;
    maint();
    var m = me();
    if (!m) renderPicker(); else if (m.role === "kind") renderKid(m); else renderParent(m);
    V.pop = "";
  }
  function go(tab) { V.tab = tab; render(); window.scrollTo(0, 0); }

  /* ---------- start- en inlogschermen ---------- */
  function gateWrap(inner) { return '<div class="gate"><div class="glogo">' + LOGO + "</div>" + inner + "</div>"; }
  function renderGate(g) {
    var h = "";
    if (g === "g_welkom") {
      h = gateWrap('<h1>Thuis</h1><p class="lead">Klusjes, sterren, spaarpot en afspraken voor het hele gezin.</p>' +
        '<button class="btn wide" data-a="g" data-g="cloud">Gezin instellen</button>' +
        '<button class="btn wide ghost" data-a="g" data-g="link">Ik heb een koppellink</button>' +
        '<button class="btn wide ghost" data-a="gLocal">Eerst uitproberen op deze telefoon</button>' +
        '<p class="mut sm">Voor ‘Gezin instellen’ heb je een eigen Firebase-project nodig. De stappen staan in INSTALLATIE.md. Uitproberen kan meteen; je gegevens kun je later meenemen.</p>');
    } else if (g === "g_cloud") {
      h = gateWrap('<h1>Gezin instellen</h1><p class="lead">Plak de gegevens van je Firebase-project. Die vind je in Firebase bij Projectinstellingen → Jouw apps → Web-app.</p>' +
        '<form data-f="gcloud" class="form"><label>databaseURL<input name="db" required autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="https://thuis-xxxx-default-rtdb.europe-west1.firebasedatabase.app"></label>' +
        '<label>apiKey (Web API-sleutel)<input name="key" required autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="AIza…"></label><p class="err" role="alert"></p>' +
        '<button class="btn wide">Verder</button><button type="button" class="btn wide ghost" data-a="g" data-g="welkom">Terug</button></form>');
    } else if (g === "g_link") {
      h = gateWrap('<h1>Telefoon koppelen</h1><p class="lead">Plak de koppellink die je van je partner kreeg (Instellingen → Telefoon koppelen).</p>' +
        '<form data-f="glink" class="form"><label>Koppellink<textarea name="link" rows="3" required autocapitalize="off" spellcheck="false" placeholder="https://…#koppel=…"></textarea></label><p class="err" role="alert"></p>' +
        '<button class="btn wide">Verder</button><button type="button" class="btn wide ghost" data-a="g" data-g="welkom">Terug</button></form>');
    } else if (g.indexOf("acc_") === 0) {
      var nieuw = V.acc === "nieuw" && !Store.lost;
      h = gateWrap('<h1>' + (Store.lost ? "Opnieuw inloggen" : "Gezinsaccount") + "</h1>" +
        (Store.lost ? '<p class="lead">Je bent afgemeld. Log opnieuw in met het gezinsaccount.</p>' : '<p class="lead">Het hele gezin gebruikt één account. Op elke telefoon log je één keer in; daarna kies je wie je bent.</p>') +
        (Store.lost ? "" : '<div class="seg"><button class="' + (nieuw ? "on" : "") + '" data-a="acc" data-k="nieuw">Nieuw gezin</button><button class="' + (nieuw ? "" : "on") + '" data-a="acc" data-k="login">Inloggen</button></div>') +
        '<form data-f="gacc" class="form"><label>E-mailadres van het gezin<input name="email" type="email" required autocomplete="username" value="' + esc(V.email || Store.email || "") + '"></label>' +
        '<label>Wachtwoord<input name="pw" type="password" required minlength="6" autocomplete="' + (nieuw ? "new-password" : "current-password") + '"></label>' +
        (nieuw ? '<label>Wachtwoord nog een keer<input name="pw2" type="password" required minlength="6" autocomplete="new-password"></label>' : "") +
        (nieuw && Store.hasLocal() ? '<label class="chk"><input type="checkbox" name="carry" checked> Neem de gegevens van het uitproberen mee</label>' : "") +
        '<p class="err" role="alert"></p><button class="btn wide">' + (nieuw ? "Gezinsaccount maken" : "Inloggen") + "</button>" +
        (nieuw ? "" : '<button type="button" class="btn wide ghost" data-a="forgotPw">Wachtwoord vergeten?</button>') +
        '<button type="button" class="btn wide ghost" data-a="gReset">Andere database kiezen</button></form>');
    } else if (g === "loading") {
      h = gateWrap('<div class="spin"></div><h1>Verbinden met je gezin…</h1><p id="ldst">' + statusHtml() + '</p><p class="mut sm">Duurt het lang? Controleer je internet.</p>' +
        '<button class="btn wide ghost" data-a="retry">Opnieuw proberen</button><button class="btn wide ghost" data-a="signOut">Uitloggen</button>');
    } else if (g === "denied") {
      h = gateWrap('<h1>Database geeft geen toegang</h1><p class="lead">Ga in Firebase naar Realtime Database → Regels, vervang alles door de regels hieronder en kies Publiceren.</p><pre class="code">' + esc(RULES) + "</pre>" +
        '<button class="btn wide" data-a="copyRules">Regels kopiëren</button><button class="btn wide ghost" data-a="retry">Opnieuw proberen</button><button class="btn wide ghost" data-a="signOut">Uitloggen</button>');
    } else if (g === "fout") {
      h = gateWrap('<h1>Er ging iets mis</h1><p class="lead">' + esc(Store.statusMsg) + '</p><button class="btn wide" data-a="retry">Opnieuw proberen</button><button class="btn wide ghost" data-a="gReset">Andere database kiezen</button>');
    } else if (g === "first") {
      h = gateWrap('<h1>Welkom!</h1><p class="lead">Maak eerst je eigen profiel als ouder. Daarna voeg je de kinderen toe.</p>' +
        '<form data-f="first" class="form"><label>Je naam<input name="name" required maxlength="20" autocomplete="given-name"></label>' +
        '<div class="lbl">Plaatje</div>' + emoPick("emoji", EM_P, "👩") +
        '<div class="lbl">Kleur</div>' + colorPick("color", COLORS, COLORS[3]) +
        '<label>Pincode voor ouders (4 cijfers)<input name="pin" type="password" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" required autocomplete="off"></label>' +
        '<label>Pincode nog een keer<input name="pin2" type="password" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" required autocomplete="off"></label>' +
        '<p class="mut sm">Met de pincode komen kinderen niet in het ouderscherm.</p><p class="err" role="alert"></p><button class="btn wide">Beginnen</button></form>');
    }
    app.innerHTML = h;
    closeSheet();
    window.scrollTo(0, 0);
  }

  /* ---------- wie ben jij ---------- */
  function renderPicker() {
    app.innerHTML = '<div class="picker"><div class="glogo">' + LOGO + "</div><h1>Wie ben jij?</h1><div class=\"pgrid\">" +
      profs().map(function (p) {
        return '<button class="pbtn" data-a="pick" data-id="' + p.id + '">' + av(p, 84) + "<b>" + esc(p.name) + "</b>" + (p.pin ? '<small aria-label="met pincode">🔒</small>' : "<small>&nbsp;</small>") + "</button>";
      }).join("") + '</div><p class="foot">' + statusHtml() + "</p></div>";
  }
  var pin = { buf: "", p: null, mode: "check", first: "" };
  function openPin(p, mode) { pin = { buf: "", p: p, mode: mode || "check", first: "" }; openSheet(pinHtml(), "pinsheet"); }
  function pinHtml() {
    var p = pin.p, title = pin.mode === "check" ? "Hoi " + esc(p.name) + "!" : pin.mode === "new" ? "Nieuwe pincode" : "Nog een keer";
    var sub = pin.mode === "check" ? "Typ je pincode" : pin.mode === "new" ? "Kies 4 cijfers" : "Typ de nieuwe pincode nog een keer";
    return '<div class="pinpad">' + av(p, 64) + "<h2>" + title + '</h2><p class="mut">' + sub + '</p><div class="dots" id="pdots">' + dots() + '</div><div class="keys">' +
      [1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (n) { return '<button data-a="pk" data-k="' + n + '">' + n + "</button>"; }).join("") +
      '<button class="kf" data-a="pinForgot">' + (pin.mode === "check" ? "Vergeten?" : "") + '</button><button data-a="pk" data-k="0">0</button><button data-a="pk" data-k="del" aria-label="Wissen">⌫</button></div></div>';
  }
  function dots() { var s = ""; for (var i = 0; i < 4; i++) s += '<i class="' + (i < pin.buf.length ? "on" : "") + '"></i>'; return s; }
  function hashPin(id, code) {
    var s = "thuis:" + id + ":" + code;
    if (window.crypto && crypto.subtle && window.TextEncoder) {
      return crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)).then(function (b) {
        return Array.prototype.map.call(new Uint8Array(b), function (x) { return (x < 16 ? "0" : "") + x.toString(16); }).join("");
      });
    }
    var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return Promise.resolve("f" + (h >>> 0).toString(16));
  }
  function pinKey(k) {
    if (!pin.p) return;
    if (k === "del") pin.buf = pin.buf.slice(0, -1);
    else if (pin.buf.length < 4) pin.buf += k;
    var el = document.getElementById("pdots"); if (el) el.innerHTML = dots();
    if (pin.buf.length < 4) return;
    var code = pin.buf;
    if (pin.mode === "new") { pin.first = code; pin.buf = ""; pin.mode = "again"; setSheet(pinHtml()); return; }
    if (pin.mode === "again") {
      if (code !== pin.first) { pin.mode = "new"; pin.buf = ""; setSheet(pinHtml()); shake(); toast("De pincodes waren niet gelijk"); return; }
      var pid = pin.p.id;
      hashPin(pid, code).then(function (h) { Store.put("profiles/" + pid + "/pin", h); closeSheet(); toast("Nieuwe pincode opgeslagen"); setWho(pid); });
      return;
    }
    hashPin(pin.p.id, code).then(function (h) {
      if (h === pin.p.pin) { var id = pin.p.id; closeSheet(); setWho(id); }
      else { pin.buf = ""; var d = document.getElementById("pdots"); if (d) d.innerHTML = dots(); shake(); }
    });
  }
  function shake() { var el = sheetEl.querySelector(".pinpad"); if (!el) return; el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake"); }
  function setWho(id) { V.who = id; lsSet("thuis.who", id); V.tab = "home"; V.ktab = "klus"; render(); window.scrollTo(0, 0); }

  /* ---------- ouders ---------- */
  var NAV = [["home", "home", "Vandaag"], ["rooster", "cal", "Rooster"], ["sterren", "star", "Sterren"], ["geld", "coin", "Geld"], ["prik", "pin", "Prikbord"]];
  function renderParent(m) {
    var n = approvals().length;
    var tab = TABS[V.tab] ? V.tab : "home";
    app.innerHTML = '<header class="top"><div class="brand"><span class="logo">' + LOGO + "</span><div><b>" + esc(cfg().name || "Thuis") + "</b><small>" + statusHtml() + "</small></div></div>" +
      '<div class="hdr-r"><button class="ibtn' + (tab === "set" ? " on" : "") + '" data-a="tab" data-t="set" aria-label="Instellingen">' + ic("gear") + '</button><button class="mebtn" data-a="switch" aria-label="Wissel van persoon">' + av(m, 34) + "</button></div></header>" +
      "<main>" + TABS[tab](m) + "</main>" +
      '<nav class="tabs">' + NAV.map(function (x) {
        return '<button class="' + (tab === x[0] ? "on" : "") + '" data-a="tab" data-t="' + x[0] + '"' + (tab === x[0] ? ' aria-current="page"' : "") + ">" + ic(x[1], 23) + "<span>" + x[2] + "</span>" + (x[0] === "home" && n ? '<em class="badge">' + n + "</em>" : "") + "</button>";
      }).join("") + "</nav>";
  }
  var TABS = {};

  TABS.home = function (m) {
    var ds = today(), h = new Date().getHours();
    var hi = h < 6 ? "Goedenacht" : h < 12 ? "Goedemorgen" : h < 18 ? "Goedemiddag" : "Goedenavond";
    var tt = tasksOn(ds), tot = 0, ok = 0;
    tt.forEach(function (x) { x.who.forEach(function (pid) { tot++; var r = doneOf(ds, x.t.id, pid); if (r && r.st === "ok") ok++; }); });
    var s = '<section class="hero"><small>' + cap(fmtLong(ds)) + "</small><h1>" + hi + ", " + esc(m.name) + "</h1><p>" +
      (tot ? ok + " van " + tot + " klusjes klaar vandaag" : "Vandaag staan er geen klusjes") + "</p>" + (tot ? bar(ok / tot, "light") : "") + "</section>";
    var ap = approvals();
    if (ap.length) s += card("Wacht op goedkeuring", ap.map(apRow).join("") + (ap.length > 1 ? '<button class="btn wide" data-a="apAll">Alles goedkeuren (' + ap.length + ")</button>" : ""), "attn");
    if (!kids().length) s += card("Aan de slag", '<p class="mut">Voeg je kinderen toe. Daarna kun je klusjes verdelen en sterren geven.</p><div class="btns"><button class="btn" data-a="profNew" data-r="kind">+ Kind toevoegen</button><button class="btn ghost" data-a="profNew" data-r="ouder">+ Ouder toevoegen</button></div>');
    var rows = personRows(ds);
    s += card("Vandaag", rows || empty("Nog geen klusjes voor vandaag.", '<button class="btn" data-a="taskNew">+ Klusje</button>' + (tasks().length ? "" : '<button class="btn ghost" data-a="starter">Voorbeeldklusjes</button>')), "", '<button class="lnk" data-a="tab" data-t="rooster">Weekrooster</button>');
    var ks = kids();
    if (ks.length) s += card("Sterren", '<div class="kidstars">' + ks.map(function (k) {
      return '<button class="ks" data-a="tab" data-t="sterren">' + av(k, 44) + "<b>" + esc(k.name) + "</b><span>⭐ " + starBal(k.id) + "</span></button>";
    }).join("") + "</div>");
    var up = upcoming(21), pins = list(D().board).filter(function (b) { return b.pin; }).sort(function (a, b) { return (b.at || 0) - (a.at || 0); });
    if (up.length || pins.length) s += card("Binnenkort", up.map(dateRow).join("") + (pins.length ? '<div class="notes mini">' + pins.map(noteCard).join("") + "</div>" : ""), "", '<button class="lnk" data-a="tab" data-t="prik">Prikbord</button>');
    return s;
  };
  function apRow(x) {
    var what, sub, data;
    if (x.type === "t") {
      what = esc(x.t.emoji || "✅") + " " + esc(x.t.title) + (x.t.stars && x.p.role === "kind" ? ' <span class="stars">+' + x.t.stars + " ⭐</span>" : "");
      sub = x.ds === today() ? "vandaag" : fmtLong(x.ds);
      data = 'data-k="t" data-d="' + x.ds + '" data-t="' + esc(x.tid) + '" data-p="' + esc(x.pid) + '"';
    } else {
      what = esc(x.r.emoji || "🎁") + " " + esc(x.r.title) + ' <span class="stars">−' + x.r.cost + " ⭐</span>";
      sub = "kiest een beloning";
      data = 'data-k="r" data-id="' + esc(x.id) + '"';
    }
    return '<div class="row ap">' + av(x.p, 38) + '<div class="t"><b>' + what + "</b><small>" + esc(x.p.name) + " · " + sub + "</small></div>" +
      '<button class="okb" data-a="apOk" ' + data + ' aria-label="Goedkeuren">' + ic("check", 20) + '</button><button class="nob" data-a="apNo" ' + data + ' aria-label="Afkeuren">' + ic("x", 18) + "</button></div>";
  }
  function personRows(ds) {
    var map = {};
    tasksOn(ds).forEach(function (x) { x.who.forEach(function (pid) { (map[pid] = map[pid] || []).push(x.t); }); });
    return profs().filter(function (p) { return map[p.id]; }).map(function (p) {
      return '<div class="prow">' + av(p, 38) + '<div class="pt"><b>' + esc(p.name) + '</b><div class="chips">' + map[p.id].map(function (t) { return chip(ds, t, p); }).join("") + "</div></div></div>";
    }).join("");
  }
  function chip(ds, t, p) {
    var r = doneOf(ds, t.id, p.id), st = r ? r.st : "", key = ds + t.id + p.id;
    return '<button class="chip ' + st + (V.pop === key ? " pop" : "") + '" data-a="ptog" data-d="' + ds + '" data-t="' + esc(t.id) + '" data-p="' + esc(p.id) + '"' + (ds > today() ? " disabled" : "") + ">" +
      "<span>" + esc(t.emoji || "✅") + "</span>" + esc(t.title) + (st === "ok" ? ' <b class="ck">✓</b>' : st === "wacht" ? " ⏳" : "") + "</button>";
  }

  TABS.rooster = function () {
    var mon = addD(monday(today()), V.week * 7), sun = addD(mon, 6), td = today();
    var s = '<div class="toolbar"><h1>Weekrooster</h1><button class="btn sm" data-a="taskNew">' + ic("plus", 18) + " Klusje</button></div>" +
      '<div class="weeknav"><button class="ibtn" data-a="wk" data-n="-1" aria-label="Vorige week">' + ic("chevL") + "</button><div><b>Week " + int(weekKey(mon).split("W")[1]) + "</b><small>" + fmtShort(mon) + " – " + fmtShort(sun) + "</small></div>" +
      '<button class="ibtn" data-a="wk" data-n="1" aria-label="Volgende week">' + ic("chevR") + "</button></div>" +
      (V.week ? '<p class="center"><button class="lnk" data-a="wk" data-n="0">Terug naar deze week</button></p>' : "");
    if (!tasks().length) return s + card("", empty("Nog geen klusjes. Maak er een of begin met voorbeelden.", '<button class="btn" data-a="taskNew">+ Klusje</button><button class="btn ghost" data-a="starter">Voorbeeldklusjes</button>'));
    var days = [0, 1, 2, 3, 4, 5, 6].map(function (i) { return addD(mon, i); });
    var wt = tasks().filter(function (t) { return days.some(function (ds) { return taskOn(t, ds) && taskWho(t, ds).length; }); })
      .sort(function (a, b) { return (PIDX[a.part] != null ? PIDX[a.part] : 3) - (PIDX[b.part] != null ? PIDX[b.part] : 3) || (a.at || 0) - (b.at || 0); });
    var g = '<div class="rgrid" role="table" aria-label="Weekrooster"><div class="rr rh" role="row"><span class="r0" role="columnheader">Klusje</span>' + days.map(function (ds) {
      return '<span class="rc' + (ds === td ? " td" : "") + '" role="columnheader"><b>' + DK[isoDay(ds)] + "</b><small>" + pd(ds).getDate() + "</small></span>";
    }).join("") + "</div>" + wt.map(function (t) {
      return '<div class="rr" role="row"><span class="r0" role="rowheader"><span class="re">' + esc(t.emoji || "✅") + "</span><span>" + esc(t.title) + "</span></span>" + days.map(function (ds) {
        var who = taskOn(t, ds) ? taskWho(t, ds) : [];
        return '<span class="rc' + (ds === td ? " td" : "") + '" role="cell">' + who.slice(0, 3).map(function (pid) { return avTog(ds, t, P(pid), 25); }).join("") + (who.length > 3 ? "<small>+" + (who.length - 3) + "</small>" : "") + "</span>";
      }).join("") + "</div>";
    }).join("") + "</div>";
    s += card("", (wt.length ? g : empty("Deze week staan er geen klusjes.")) + '<p class="mut sm legend">Tik op een plaatje om af te vinken. ✓ klaar · ⏳ wacht op goedkeuring</p>', "gridcard");
    s += card("Alle klusjes", tasks().map(function (t) {
      return '<button class="row" data-a="taskEdit" data-id="' + esc(t.id) + '"><span class="ico">' + esc(t.emoji || "✅") + '</span><span class="t"><b>' + esc(t.title) + "</b><small>" + esc(schedText(t)) + "</small></span>" + (t.stars ? '<span class="st">⭐ ' + t.stars + "</span>" : "") + "</button>";
    }).join(""));
    return s;
  };
  function avTog(ds, t, p, size) {
    var r = doneOf(ds, t.id, p.id), st = r ? r.st : "", fut = ds > today(), key = ds + t.id + p.id;
    return '<button class="avt ' + st + (V.pop === key ? " pop" : "") + '" data-a="ptog" data-d="' + ds + '" data-t="' + esc(t.id) + '" data-p="' + esc(p.id) + '"' + (fut ? " disabled" : "") +
      ' aria-label="' + esc(p.name + ": " + (st === "ok" ? "klaar" : st === "wacht" ? "wacht op goedkeuring" : "nog doen")) + '">' + av(p, size || 32) + (st ? "<i>" + (st === "ok" ? "✓" : "⏳") + "</i>" : "") + "</button>";
  }

  TABS.sterren = function () {
    var s = '<div class="toolbar"><h1>Sterren</h1></div>';
    var rq2 = reqs();
    if (rq2.length) s += card("Gekozen beloningen", rq2.map(function (r) { var p = P(r.pid); return p ? apRow({ type: "r", id: r.id, r: r, p: p }) : ""; }).join(""), "attn");
    var ks = kids();
    if (!ks.length) s += card("", empty("Voeg eerst een kind toe.", '<button class="btn" data-a="profNew" data-r="kind">+ Kind toevoegen</button>'));
    ks.forEach(function (k) {
      var b = starBal(k.id);
      s += '<section class="card kidc"><div class="kidhd">' + av(k, 50) + '<div><b>' + esc(k.name) + '</b><div class="bignum">⭐ ' + b + '</div><small class="mut">= ' + euro(Math.round(Math.max(b, 0) / rate() * 100)) + " als zakgeld</small></div></div>" +
        '<div class="btns"><button class="btn sm" data-a="starAdj" data-p="' + k.id + '" data-n="1">+ Sterren</button><button class="btn sm ghost" data-a="starAdj" data-p="' + k.id + '" data-n="-1">− Sterren</button>' +
        '<button class="btn sm ghost" data-a="convert" data-p="' + k.id + '">→ Spaarpot</button><button class="btn sm ghost" data-a="starHist" data-p="' + k.id + '">Geschiedenis</button></div></section>';
    });
    var rw = list(D().rewards).filter(function (r) { return r.title; }).sort(function (a, b) { return (a.cost || 0) - (b.cost || 0); });
    s += card("Beloningen", rw.length ? rw.map(function (r) {
      return '<button class="row" data-a="rewEdit" data-id="' + esc(r.id) + '"><span class="ico">' + esc(r.emoji || "🎁") + '</span><span class="t"><b>' + esc(r.title) + '</b></span><span class="st">⭐ ' + r.cost + "</span></button>";
    }).join("") : empty("Nog geen beloningen. Kinderen kunnen hun sterren hiervoor inwisselen.", '<button class="btn" data-a="rewEdit">+ Beloning</button><button class="btn ghost" data-a="starterRew">Voorbeelden</button>'), "", rw.length ? '<button class="lnk" data-a="rewEdit">+ Beloning</button>' : "");
    s += '<p class="mut sm center">' + rate() + " sterren = € 1,00 · " + (approveOn() ? "klusjes worden eerst door een ouder goedgekeurd" : "klusjes tellen meteen") + ' · <button class="lnk" data-a="tab" data-t="set">wijzigen</button></p>';
    return s;
  };

  TABS.geld = function () {
    if (!V.month) V.month = today().slice(0, 7);
    return '<div class="toolbar"><h1>Geld</h1>' + (V.geld === "uit" ? '<button class="btn sm" data-a="expEdit">' + ic("plus", 18) + " Uitgave</button>" : "") + "</div>" +
      '<div class="seg"><button class="' + (V.geld === "pot" ? "on" : "") + '" data-a="geld" data-k="pot">🐷 Spaarpot</button><button class="' + (V.geld === "uit" ? "on" : "") + '" data-a="geld" data-k="uit">🧾 Uitgaven</button></div>' +
      (V.geld === "uit" ? geldUit() : geldPot());
  };
  function geldPot() {
    var ks = kids();
    if (!ks.length) return card("", empty("Voeg eerst een kind toe.", '<button class="btn" data-a="profNew" data-r="kind">+ Kind toevoegen</button>'));
    return ks.map(function (k) {
      var b = potBal(k.id), g = obj(k.goal);
      return '<section class="card kidc"><div class="kidhd">' + av(k, 50) + "<div><b>" + esc(k.name) + '</b><div class="bignum">' + euro(b) + '</div><small class="mut">' +
        (k.weekgeld > 0 ? "Weekgeld " + euro(k.weekgeld) + ", elke maandag" : "Geen weekgeld") + "</small></div></div>" +
        (g.c > 0 ? '<div class="goal"><div class="gl"><span>' + esc(g.emoji || "🎯") + " " + esc(g.name || "Spaardoel") + "</span><span>" + euro(Math.max(b, 0)) + " van " + euro(g.c) + "</span></div>" + bar(b / g.c, b >= g.c ? "ok" : "") + "</div>" : "") +
        '<div class="btns"><button class="btn sm" data-a="potAdj" data-p="' + k.id + '" data-n="1">+ Erbij</button><button class="btn sm ghost" data-a="potAdj" data-p="' + k.id + '" data-n="-1">− Eraf</button>' +
        '<button class="btn sm ghost" data-a="goal" data-p="' + k.id + '">Spaardoel</button><button class="btn sm ghost" data-a="wg" data-p="' + k.id + '">Weekgeld</button><button class="btn sm ghost" data-a="potHist" data-p="' + k.id + '">Geschiedenis</button></div></section>';
    }).join("") + '<p class="mut sm center">Sterren omzetten naar de spaarpot doe je bij Sterren → Spaarpot.</p>';
  }
  function geldUit() {
    var mk = V.month, bud = +cfg().budget || 0;
    var items = list(D().exp).filter(function (e) { return (e.d || "").slice(0, 7) === mk && e.c; })
      .sort(function (a, b) { return String(b.d).localeCompare(a.d) || (b.at || 0) - (a.at || 0); });
    var tot = items.reduce(function (a, e) { return a + (+e.c || 0); }, 0);
    var s = '<div class="weeknav"><button class="ibtn" data-a="mon" data-n="-1" aria-label="Vorige maand">' + ic("chevL") + "</button><div><b>" + cap(fmtMonth(mk)) + "</b><small>" + items.length + " uitgave" + (items.length === 1 ? "" : "n") + "</small></div>" +
      '<button class="ibtn" data-a="mon" data-n="1" aria-label="Volgende maand">' + ic("chevR") + "</button></div>";
    var sumH = '<div class="total"><span class="bignum">' + euro(tot) + "</span>" + (bud ? "<small>van " + euro(bud) + " budget</small>" : '<small><button class="lnk" data-a="askBudget">Maandbudget instellen</button></small>') + "</div>";
    if (bud) sumH += bar(tot / bud, tot > bud ? "over" : "") + '<p class="sm ' + (tot > bud ? "red" : "mut") + '">' + (tot > bud ? euro(tot - bud) + " boven budget" : "Nog " + euro(bud - tot) + " over deze maand") + "</p>";
    s += card("", sumH);
    if (!items.length) return s + card("", empty("Geen uitgaven in " + fmtMonth(mk) + ".", '<button class="btn" data-a="expEdit">+ Uitgave</button>'));
    var byCat = {}, byWho = {};
    items.forEach(function (e) { byCat[e.cat || "overig"] = (byCat[e.cat || "overig"] || 0) + e.c; byWho[e.who || "gezin"] = (byWho[e.who || "gezin"] || 0) + e.c; });
    var max = Math.max.apply(null, Object.keys(byCat).map(function (k) { return byCat[k]; }));
    s += card("Per soort", CATS.filter(function (c) { return byCat[c[0]]; }).sort(function (a, b) { return byCat[b[0]] - byCat[a[0]]; }).map(function (c) {
      return '<div class="crow"><span class="ce">' + c[1] + '</span><div class="cb"><div class="gl"><span>' + c[2] + "</span><b>" + euro(byCat[c[0]]) + "</b></div>" + bar(byCat[c[0]] / max) + "</div></div>";
    }).join(""));
    s += card("Voor wie", '<div class="whochips">' + [{ id: "gezin", name: "Hele gezin", emoji: "🏠", color: "#e6ddd3" }].concat(kids()).filter(function (p) { return byWho[p.id]; }).map(function (p) {
      return '<span class="wchip">' + av(p, 26) + esc(p.name) + " <b>" + euro(byWho[p.id]) + "</b></span>";
    }).join("") + "</div>");
    var last = "";
    s += card("Alle uitgaven", items.map(function (e) {
      var c = CATS.filter(function (x) { return x[0] === e.cat; })[0] || CATS[CATS.length - 1], p = P(e.who), hd = "";
      if (e.d !== last) { last = e.d; hd = '<div class="dh">' + cap(fmtLong(e.d)) + "</div>"; }
      return hd + '<button class="row" data-a="expEdit" data-id="' + esc(e.id) + '"><span class="ico">' + c[1] + '</span><span class="t"><b>' + esc(e.note || c[2]) + "</b><small>" + esc(c[2]) + " · " + esc(p ? p.name : "Hele gezin") + '</small></span><span class="st">' + euro(e.c) + "</span></button>";
    }).join(""));
    return s;
  }

  TABS.prik = function () {
    var s = '<div class="toolbar"><h1>Prikbord</h1><div class="btns"><button class="btn sm" data-a="noteEdit">' + ic("plus", 18) + ' Bericht</button><button class="btn sm ghost" data-a="dateEdit">' + ic("plus", 18) + " Datum</button></div></div>";
    var up = upcoming(400), past = list(D().dates).filter(function (x) { return !x.yearly && x.d && x.d < addD(today(), -1); });
    s += card("Belangrijke datums", (up.length ? up.map(dateRow).join("") : empty("Zet hier verjaardagen, schoolreisjes en andere belangrijke dagen.", '<button class="btn ghost" data-a="dateEdit">+ Datum</button>')) +
      (past.length ? '<button class="btn ghost wide" data-a="datesClean">' + past.length + " oude datum" + (past.length > 1 ? "s" : "") + " opruimen</button>" : ""));
    var notes = list(D().board).filter(function (b) { return b.text; }).sort(function (a, b) { return (b.pin ? 1 : 0) - (a.pin ? 1 : 0) || (b.at || 0) - (a.at || 0); });
    s += notes.length ? '<div class="notes">' + notes.map(noteCard).join("") + "</div>" : card("Berichten", empty("Nog geen berichten. Zet hier briefjes voor elkaar neer.", '<button class="btn ghost" data-a="noteEdit">+ Bericht</button>'));
    return s;
  };
  function dateRow(x) {
    return '<button class="row" data-a="dateEdit" data-id="' + esc(x.id) + '"><span class="ico">' + esc(x.emoji || "📅") + '</span><span class="t"><b>' + esc(x.title) + "</b><small>" + cap(fmtLong(x.next)) + (x.age ? " · " + x.age + " jaar" : "") + '</small></span><span class="when' + (x.inn <= 1 ? " soon" : "") + '">' + inText(x.inn) + "</span></button>";
  }
  function noteCard(b) {
    var p = P(b.by);
    return '<button class="note" data-a="noteEdit" data-id="' + esc(b.id) + '" style="--n:' + esc(b.color || NOTES[0]) + '"><span class="ne">' + esc(b.emoji || "📌") + (b.pin ? ' <small class="pinned">vastgezet</small>' : "") + '</span><span class="nt">' + esc(b.text) + '</span><span class="nf">' + (p ? esc(p.name) + " · " : "") + ago(b.at) + "</span></button>";
  }

  TABS.set = function (m) {
    var s = '<div class="toolbar"><button class="lnk back" data-a="tab" data-t="home">' + ic("back", 18) + " Terug</button></div><h1 class=\"pt0\">Instellingen</h1>";
    s += card("Gezinsleden", profs().map(function (p) {
      return '<button class="row" data-a="profEdit" data-id="' + p.id + '">' + av(p, 38) + '<span class="t"><b>' + esc(p.name) + (p.id === m.id ? " (jij)" : "") + "</b><small>" + (p.role === "kind" ? "Kind" : "Ouder") + (p.pin ? " · pincode" : " · geen pincode") + "</small></span></button>";
    }).join("") + '<div class="btns"><button class="btn sm" data-a="profNew" data-r="kind">+ Kind</button><button class="btn sm ghost" data-a="profNew" data-r="ouder">+ Ouder</button></div>');
    s += card("Gezin",
      '<button class="row" data-a="askName"><span class="t"><b>Naam van het gezin</b><small>Staat bovenaan in de app</small></span><span class="st">' + esc(cfg().name || "Thuis") + "</span></button>" +
      '<button class="row" data-a="togApprove"><span class="t"><b>Klusjes goedkeuren</b><small>' + (approveOn() ? "Een ouder keurt een klusje goed voordat er sterren komen" : "Sterren komen meteen als een kind afvinkt") + '</small></span><span class="sw' + (approveOn() ? " on" : "") + '" role="switch" aria-checked="' + approveOn() + '"><i></i></span></button>' +
      '<button class="row" data-a="askRate"><span class="t"><b>Sterren per euro</b><small>Voor sterren omzetten naar de spaarpot</small></span><span class="st">' + rate() + " ⭐ = € 1</span></button>" +
      '<button class="row" data-a="askBudget"><span class="t"><b>Maandbudget uitgaven</b><small>Voor het overzicht bij Geld → Uitgaven</small></span><span class="st">' + (cfg().budget ? euro(cfg().budget) : "niet ingesteld") + "</span></button>");
    if (Store.mode === "cloud") {
      s += card("Telefoon koppelen", '<p class="mut">Stuur deze link naar je partner of open hem op een tablet. Log daarna in met het gezinsaccount <b>' + esc(Store.email) + "</b>.</p>" +
        '<div class="btns"><button class="btn" data-a="shareLink">' + ic("share", 18) + ' Koppellink delen</button><button class="btn ghost" data-a="copyLink">Kopiëren</button></div>');
      s += card("Account", '<p class="mut">Ingelogd als <b>' + esc(Store.email) + "</b><br>" + statusHtml() + "</p>" +
        '<div class="btns"><button class="btn ghost" data-a="retry">Opnieuw verbinden</button><button class="btn danger" data-a="signOut">Uitloggen op deze telefoon</button></div>');
    } else {
      s += card("Online zetten", '<p class="mut">Je gegevens staan nu alleen op deze telefoon. Met een gezinsaccount (Firebase) zie je alles op elke telefoon in het gezin. Je proefgegevens kun je meenemen.</p><button class="btn" data-a="goCloud">Gezinsaccount maken</button>');
      s += card("Proefgegevens", '<p class="mut">Begin opnieuw met een lege app.</p><button class="btn danger" data-a="wipeLocal">Alles wissen</button>');
    }
    s += '<p class="mut sm center">Thuis · versie 1.0</p>';
    return s;
  };

  /* ---------- kinderen ---------- */
  function renderKid(k) {
    var body = V.ktab === "bel" ? kidRewards(k) : V.ktab === "pot" ? kidPot(k) : kidTasks(k);
    app.innerHTML = '<div class="kid"><header class="khead" style="--c:' + esc(k.color || "#f6c453") + '">' + av(k, 58) + '<div class="kname"><b>' + esc(k.name) + '</b><span class="kstars">⭐ ' + starBal(k.id) + "</span></div>" +
      '<button class="kswitch" data-a="switch" aria-label="Wissel van persoon">' + ic("users", 26) + "</button></header>" +
      '<main class="kmain">' + body + "</main>" +
      '<nav class="knav">' + [["klus", "⭐", "Klusjes"], ["bel", "🎁", "Beloningen"], ["pot", "🐷", "Spaarpot"]].map(function (x) {
        return '<button class="' + (V.ktab === x[0] ? "on" : "") + '" data-a="ktab" data-k="' + x[0] + '"><span>' + x[1] + "</span>" + x[2] + "</button>";
      }).join("") + "</nav></div>";
  }
  function kidTasks(k) {
    var ds = today(), mine = tasksOn(ds).filter(function (x) { return x.who.indexOf(k.id) >= 0; }).map(function (x) { return x.t; });
    var s = "", up = upcoming(14).slice(0, 2);
    if (up.length) s += '<div class="kup">' + up.map(function (x) {
      return '<div class="kupi"><span class="kue">' + esc(x.emoji || "📅") + "</span><div><b>" + esc(x.title) + "</b><small>" + nights(x.inn) + "</small></div>" + spk(x.title + ". " + nights(x.inn).replace("🎉", "")) + "</div>";
    }).join("") + "</div>";
    if (!mine.length) return s + '<div class="kempty"><div class="kbig">🌈</div><p>Vandaag geen klusjes!</p></div>';
    var allOk = mine.every(function (t) { var r = doneOf(ds, t.id, k.id); return r && r.st === "ok"; });
    if (allOk) s += '<div class="kdone">🎉 Alles klaar! Goed gedaan!</div>';
    PARTS.forEach(function (pt) {
      var ts = mine.filter(function (t) { return (t.part || "") === pt[0]; });
      if (!ts.length) return;
      s += '<h2 class="kpart">' + pt[1] + " " + pt[2] + '</h2><div class="tiles">' + ts.map(function (t) {
        var r = doneOf(ds, t.id, k.id), st = r ? r.st : "", key = ds + t.id + k.id;
        var stars = t.stars ? (t.stars <= 5 ? new Array(t.stars + 1).join("⭐") : "⭐ × " + t.stars) : "";
        return '<div class="tile ' + st + (V.pop === key ? " pop" : "") + '"><button class="tbtn" data-a="ktog" data-t="' + esc(t.id) + '"><span class="te">' + esc(t.emoji || "✅") + "</span><b>" + esc(t.title) + '</b><span class="ts">' + stars + '</span><span class="tstat">' +
          (st === "ok" ? "✓ Klaar!" : st === "wacht" ? "⏳ Wordt nagekeken" : "Tik als je klaar bent") + "</span></button>" + spk(t.title) + "</div>";
      }).join("") + "</div>";
    });
    return s;
  }
  function kidRewards(k) {
    var bal = starBal(k.id), mine = reqs(k.id), held = mine.reduce(function (a, r) { return a + (+r.cost || 0); }, 0), avail = bal - held;
    var rw = list(D().rewards).filter(function (r) { return r.title; }).sort(function (a, b) { return (a.cost || 0) - (b.cost || 0); });
    var s = "";
    if (mine.length) s += '<div class="kwait">' + mine.map(function (r) {
      return '<div class="kwi"><span>' + esc(r.emoji || "🎁") + "</span><div><b>" + esc(r.title) + "</b><small>⏳ " + esc(bossName()) + ' kijkt ernaar</small></div><button class="x" data-a="reqCancel" data-id="' + esc(r.id) + '" aria-label="Toch niet">' + ic("x", 18) + "</button></div>";
    }).join("") + "</div>";
    if (!rw.length) return s + '<div class="kempty"><div class="kbig">🎁</div><p>Er zijn nog geen beloningen.</p></div>';
    return s + '<div class="tiles">' + rw.map(function (r) {
      var can = avail >= r.cost;
      return '<div class="tile rw' + (can ? " can" : "") + '"><button class="tbtn" data-a="kreq" data-id="' + esc(r.id) + '"' + (can ? "" : ' aria-disabled="true"') + '><span class="te">' + esc(r.emoji || "🎁") + "</span><b>" + esc(r.title) + '</b><span class="ts">⭐ ' + r.cost + "</span>" +
        bar(avail / r.cost, can ? "ok" : "") + '<span class="tstat">' + (can ? "Kies mij!" : "Nog " + (r.cost - Math.max(avail, 0)) + " ⭐") + "</span></button>" + spk(r.title + ". " + r.cost + " sterren") + "</div>";
    }).join("") + "</div>";
  }
  function kidPot(k) {
    var b = potBal(k.id), g = obj(k.goal), sb = starBal(k.id);
    var s = '<div class="pig"><div class="pige">🐷</div><div class="pigv">' + euro(b) + "</div>" + spk("Je hebt " + euro(b).replace("€", "").trim() + " euro in je spaarpot") + "</div>";
    if (g.c > 0) s += '<div class="kgoal"><span class="kue">' + esc(g.emoji || "🎯") + "</span><div><b>Ik spaar voor: " + esc(g.name || "iets moois") + "</b>" + bar(b / g.c, b >= g.c ? "ok big" : "big") +
      "<small>" + (b >= g.c ? "🎉 Je hebt genoeg gespaard!" : "Nog " + euro(g.c - Math.max(b, 0)) + " te gaan") + "</small></div></div>";
    if (sb > 0) s += '<p class="khint">Je ⭐ ' + sb + " sterren zijn samen " + euro(Math.round(sb / rate() * 100)) + " waard.</p>";
    var h = list(obj(D().pot)[k.id]).sort(function (a, b2) { return (b2.at || 0) - (a.at || 0); }).slice(0, 8);
    if (h.length) s += '<div class="khist">' + h.map(function (e) {
      return '<div class="khr"><span>' + esc(e.why || "") + '</span><b class="' + (e.c < 0 ? "red" : "grn") + '">' + (e.c < 0 ? "−" : "+") + euro(Math.abs(e.c)) + "</b></div>";
    }).join("") + "</div>";
    return s;
  }

  /* ---------- onderblad (sheet) ---------- */
  function openSheet(html, cls) {
    sheetEl.innerHTML = '<div class="sheet-bg" data-a="close"></div><div class="sheet-panel ' + (cls || "") + '" role="dialog" aria-modal="true"><button class="sheet-x" data-a="close" aria-label="Sluiten">' + ic("x", 20) + '</button><div class="sheet-body">' + html + "</div></div>";
    if (sheetEl.hidden) {
      sheetEl.hidden = false; document.body.classList.add("noscroll");
      requestAnimationFrame(function () { sheetEl.classList.add("open"); });
    }
    syncIf();
  }
  function setSheet(html) { var b = sheetEl.querySelector(".sheet-body"); if (b) { b.innerHTML = html; syncIf(); } }
  function closeSheet() { if (sheetEl.hidden) return; sheetEl.classList.remove("open"); sheetEl.hidden = true; sheetEl.innerHTML = ""; document.body.classList.remove("noscroll"); pin.p = null; }
  // Velden tonen/verbergen: data-if="naam=waarde"
  function syncIf() {
    var f = sheetEl.querySelector("form"); if (!f) return;
    f.querySelectorAll("[data-if]").forEach(function (el) {
      var c = el.getAttribute("data-if").split("="), inp = f.querySelectorAll('[name="' + c[0] + '"]'), val = "";
      inp.forEach(function (i) { if ((i.type !== "radio" && i.type !== "checkbox") || i.checked) val = i.value; });
      el.hidden = c[1].split("|").indexOf(val) < 0;
    });
  }

  var toastT;
  function toast(msg) {
    toastEl.textContent = msg; toastEl.hidden = false;
    requestAnimationFrame(function () { toastEl.classList.add("show"); });
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove("show"); setTimeout(function () { toastEl.hidden = true; }, 250); }, 2800);
  }
  function busy(f, on) { var b = f.querySelector("button:not([type=button])"); if (b) { b.disabled = on; b.classList.toggle("busy", on); } }
  function copyText(t) {
    function fallback() {
      var ta = document.createElement("textarea"); ta.value = t; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select(); var ok = false; try { ok = document.execCommand("copy"); } catch (e) {}
      ta.remove(); return ok;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(t).then(function () { return true; }, fallback);
    return Promise.resolve(fallback());
  }
  function linkUrl() { return location.origin + location.pathname + "#koppel=" + Store.linkCode(); }

  /* ---------- formulieren in het onderblad ---------- */
  function taskForm(id) {
    var t = id ? Object.assign({ id: id }, obj(D().tasks)[id]) : { emoji: "🧹", stars: 1, people: kids().map(function (k) { return k.id; }), mode: "samen", rot: "dag", days: [1, 2, 3, 4, 5, 6, 7], part: "" };
    var ppl = arr(t.people), days = arr(t.days);
    openSheet('<form data-f="task" data-id="' + esc(t.id || "") + '" class="form"><h2>' + (t.id ? "Klusje aanpassen" : "Nieuw klusje") + "</h2>" +
      '<label>Wat moet er gebeuren?<input name="title" required maxlength="40" value="' + esc(t.title || "") + '" placeholder="Bijvoorbeeld: Tafel dekken"></label>' +
      '<div class="lbl">Plaatje</div>' + emoPick("emoji", EM_T, t.emoji) +
      '<div class="lbl">Sterren voor dit klusje</div>' + stepper("stars", t.stars || 0, 0, 20) +
      '<div class="lbl">Wie</div>' + checks("people", profs().map(function (p) { return [p.id, esc(p.emoji) + " " + esc(p.name)]; }), ppl) +
      '<div class="lbl">Verdelen</div>' + radios("mode", [["samen", "Iedereen doet het"], ["beurt", "Om de beurt"]], t.mode || "samen") +
      '<div data-if="mode=beurt"><div class="lbl">Wisselen</div>' + radios("rot", [["dag", "Elke keer iemand anders"], ["week", "Elke week iemand anders"]], t.rot || "dag") + "</div>" +
      '<div class="lbl">Wanneer</div>' + radios("when", [["herhaal", "Vaste dagen"], ["eenmalig", "Eén keer"]], t.once ? "eenmalig" : "herhaal") +
      '<div data-if="when=herhaal">' + checks("days", [1, 2, 3, 4, 5, 6, 7].map(function (d) { return [String(d), DK[d]]; }), (days.length ? days : [1, 2, 3, 4, 5, 6, 7]).map(String)) + "</div>" +
      '<div data-if="when=eenmalig"><label>Datum<input type="date" name="once" value="' + esc(t.once || today()) + '"></label></div>' +
      '<div class="lbl">Moment van de dag</div>' + radios("part", PARTS.map(function (p) { return [p[0], p[1] + " " + p[2]]; }), t.part || "") +
      '<div class="acts"><button class="btn wide">Opslaan</button>' + delBtn("taskDel", t.id) + "</div></form>");
  }
  function rewForm(id) {
    var r = id ? obj(D().rewards)[id] : { emoji: "🍦", cost: 10 };
    openSheet('<form data-f="rew" data-id="' + esc(id || "") + '" class="form"><h2>' + (id ? "Beloning aanpassen" : "Nieuwe beloning") + "</h2>" +
      '<label>Beloning<input name="title" required maxlength="40" value="' + esc(r.title || "") + '" placeholder="Bijvoorbeeld: IJsje"></label>' +
      '<div class="lbl">Plaatje</div>' + emoPick("emoji", EM_R, r.emoji) +
      '<div class="lbl">Kost zoveel sterren</div>' + stepper("cost", r.cost || 10, 1, 500) +
      '<div class="acts"><button class="btn wide">Opslaan</button>' + delBtn("rewDel", id) + "</div></form>");
  }
  function profForm(id, role) {
    var p = id ? P(id) : { role: role || "kind", emoji: role === "ouder" ? "👨" : EM_P[kids().length % 10], color: COLORS[profs().length % COLORS.length] };
    var isMe = id && id === V.who, lastParent = p.role !== "kind" && parents().length <= 1;
    openSheet('<form data-f="prof" data-id="' + esc(id || "") + '" class="form"><h2>' + (id ? esc(p.name) + " aanpassen" : p.role === "ouder" ? "Ouder toevoegen" : "Kind toevoegen") + "</h2>" +
      '<label>Naam<input name="name" required maxlength="20" value="' + esc(p.name || "") + '"></label>' +
      (id && !lastParent ? '<div class="lbl">Rol</div>' + radios("role", [["kind", "Kind"], ["ouder", "Ouder"]], p.role === "kind" ? "kind" : "ouder") : '<input type="hidden" name="role" value="' + (p.role === "kind" ? "kind" : "ouder") + '">') +
      '<div class="lbl">Plaatje</div>' + emoPick("emoji", EM_P, p.emoji) +
      '<div class="lbl">Kleur</div>' + colorPick("color", COLORS, p.color) +
      '<label>Pincode (4 cijfers)<input name="pin" type="password" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" autocomplete="off" placeholder="' + (p.pin ? "Laat leeg om niet te wijzigen" : "") + '"></label>' +
      '<p class="mut sm" data-if="role=kind">Voor kinderen mag de pincode leeg blijven: dan tikken ze alleen op hun plaatje.</p>' +
      (p.pin ? '<label class="chk" data-if="role=kind"><input type="checkbox" name="nopin"> Pincode weghalen</label>' : "") +
      '<p class="mut sm" data-if="role=ouder">Een ouder heeft altijd een pincode.</p>' +
      '<div class="acts"><button class="btn wide">Opslaan</button>' + (id && !isMe && !lastParent ? delBtn("profDel", id) : "") + "</div></form>");
  }
  function starForm(pid, sign) {
    var k = P(pid), pres = sign > 0 ? ["Goed geholpen", "Lief voor elkaar", "Flink geweest", "Extra klusje"] : ["Afspraak niet nagekomen", "Correctie"];
    openSheet('<form data-f="stars" data-p="' + esc(pid) + '" data-s="' + sign + '" class="form"><h2>' + (sign > 0 ? "Sterren geven aan " : "Sterren afhalen bij ") + esc(k.name) + "</h2>" +
      stepper("n", 1, 1, 100) + '<label>Waarom?<input name="why" maxlength="60" placeholder="' + esc(pres[0]) + '"></label>' +
      '<div class="pills">' + pres.map(function (x) { return '<button type="button" class="pill" data-a="fillWhy" data-v="' + esc(x) + '">' + esc(x) + "</button>"; }).join("") + "</div>" +
      '<div class="acts"><button class="btn wide">' + (sign > 0 ? "Geven" : "Afhalen") + "</button></div></form>");
  }
  function convertForm(pid) {
    var k = P(pid), bal = starBal(pid), r = rate();
    if (bal <= 0) { toast(k.name + " heeft nog geen sterren"); return; }
    var def = Math.floor(bal / r) * r || bal;
    openSheet('<form data-f="convert" data-p="' + esc(pid) + '" class="form"><h2>Sterren naar spaarpot</h2><p class="mut">' + esc(k.name) + " heeft ⭐ " + bal + ". " + r + " sterren = € 1,00.</p>" +
      stepper("n", def, 1, bal) + '<p class="bignum center" data-out>' + euro(Math.round(def / r * 100)) + "</p>" +
      '<div class="acts"><button class="btn wide">Omzetten</button></div></form>');
  }
  function histSheet(kind, pid) {
    var k = P(pid), src = kind === "stars" ? obj(D().stars)[pid] : obj(D().pot)[pid];
    var h = list(src).sort(function (a, b) { return (b.at || 0) - (a.at || 0); }).slice(0, 60);
    var tot = kind === "stars" ? "⭐ " + starBal(pid) : euro(potBal(pid));
    openSheet("<h2>" + (kind === "stars" ? "Sterren van " : "Spaarpot van ") + esc(k.name) + ' <span class="mut">' + tot + "</span></h2>" +
      (h.length ? '<div class="hist">' + h.map(function (e) {
        var v = kind === "stars" ? (e.n > 0 ? "+" : "−") + Math.abs(e.n) + " ⭐" : (e.c > 0 ? "+" : "−") + euro(Math.abs(e.c));
        var neg = kind === "stars" ? e.n < 0 : e.c < 0;
        return '<div class="row"><span class="t"><b>' + esc(e.why || "") + "</b><small>" + (e.at ? cap(fmtLong(ymd(new Date(e.at)))) : "") + '</small></span><span class="st ' + (neg ? "red" : "grn") + '">' + v + '</span><button class="x" data-a="histDel" data-k="' + kind + '" data-p="' + esc(pid) + '" data-id="' + esc(e.id) + '" aria-label="Wissen">' + ic("x", 16) + "</button></div>";
      }).join("") + "</div>" : '<p class="mut">Nog niets.</p>'));
  }
  function potForm(pid, sign) {
    var k = P(pid), pres = sign > 0 ? ["Zakgeld", "Verjaardag", "Cadeautje", "Klusje"] : ["Snoep", "Speelgoed", "Uitje", "Correctie"];
    openSheet('<form data-f="pot" data-p="' + esc(pid) + '" data-s="' + sign + '" class="form"><h2>' + (sign > 0 ? "Geld erbij voor " : "Geld eraf bij ") + esc(k.name) + "</h2>" +
      '<label>Bedrag<input name="c" inputmode="decimal" required placeholder="0,00" autocomplete="off"></label><label>Waarvoor?<input name="why" maxlength="60" placeholder="' + esc(pres[0]) + '"></label>' +
      '<div class="pills">' + pres.map(function (x) { return '<button type="button" class="pill" data-a="fillWhy" data-v="' + esc(x) + '">' + esc(x) + "</button>"; }).join("") + "</div>" +
      '<div class="acts"><button class="btn wide">' + (sign > 0 ? "Erbij" : "Eraf") + "</button></div></form>");
  }
  function goalForm(pid) {
    var k = P(pid), g = obj(k.goal);
    openSheet('<form data-f="goal" data-p="' + esc(pid) + '" class="form"><h2>Spaardoel van ' + esc(k.name) + "</h2>" +
      '<label>Waarvoor spaart ' + esc(k.name) + '?<input name="name" required maxlength="30" value="' + esc(g.name || "") + '" placeholder="Bijvoorbeeld: Nieuwe step"></label>' +
      '<div class="lbl">Plaatje</div>' + emoPick("emoji", EM_R, g.emoji || "🛴") +
      '<label>Hoeveel geld is nodig?<input name="c" inputmode="decimal" required placeholder="0,00" value="' + moneyVal(g.c) + '"></label>' +
      '<div class="acts"><button class="btn wide">Opslaan</button>' + (g.c ? '<button type="button" class="btn danger" data-a="goalDel" data-p="' + esc(pid) + '">Doel weghalen</button>' : "") + "</div></form>");
  }
  function wgForm(pid) {
    var k = P(pid);
    openSheet('<form data-f="wg" data-p="' + esc(pid) + '" class="form"><h2>Weekgeld voor ' + esc(k.name) + "</h2>" +
      '<p class="mut">Elke maandag komt dit bedrag vanzelf in de spaarpot (als de app die week geopend wordt). Leeg of 0 betekent geen weekgeld.</p>' +
      '<label>Bedrag per week<input name="c" inputmode="decimal" placeholder="0,00" value="' + moneyVal(k.weekgeld) + '"></label>' +
      '<div class="acts"><button class="btn wide">Opslaan</button></div></form>');
  }
  function expForm(id) {
    var e = id ? obj(D().exp)[id] : { cat: "kleding", who: "gezin", d: V.month && V.month !== today().slice(0, 7) ? V.month + "-01" : today() };
    openSheet('<form data-f="exp" data-id="' + esc(id || "") + '" class="form"><h2>' + (id ? "Uitgave aanpassen" : "Nieuwe uitgave") + "</h2>" +
      '<label>Bedrag<input name="c" inputmode="decimal" required placeholder="0,00" autocomplete="off" value="' + moneyVal(e.c) + '"></label>' +
      '<div class="lbl">Soort</div>' + radios("cat", CATS.map(function (c) { return [c[0], c[1] + " " + c[2]]; }), e.cat || "overig") +
      '<div class="lbl">Voor wie</div>' + radios("who", [["gezin", "🏠 Hele gezin"]].concat(kids().map(function (k) { return [k.id, esc(k.emoji) + " " + esc(k.name)]; })), e.who || "gezin") +
      '<label>Datum<input type="date" name="d" required value="' + esc(e.d || today()) + '"></label>' +
      '<label>Omschrijving (mag leeg)<input name="note" maxlength="60" value="' + esc(e.note || "") + '" placeholder="Bijvoorbeeld: Winterjas"></label>' +
      '<div class="acts"><button class="btn wide">Opslaan</button>' + delBtn("expDel", id) + "</div></form>");
  }
  function noteForm(id) {
    var b = id ? obj(D().board)[id] : { emoji: "📌", color: NOTES[0] };
    openSheet('<form data-f="note" data-id="' + esc(id || "") + '" class="form"><h2>' + (id ? "Bericht" : "Nieuw bericht") + "</h2>" +
      '<label>Bericht<textarea name="text" rows="4" required maxlength="300" placeholder="Bijvoorbeeld: Gymtas mee op donderdag!">' + esc(b.text || "") + "</textarea></label>" +
      '<div class="lbl">Plaatje</div>' + emoPick("emoji", EM_M, b.emoji) +
      '<div class="lbl">Kleur</div>' + colorPick("color", NOTES, b.color || NOTES[0]) +
      '<label class="chk"><input type="checkbox" name="pin"' + (b.pin ? " checked" : "") + "> Vastzetten (ook zichtbaar bij Vandaag)</label>" +
      '<div class="acts"><button class="btn wide">Opslaan</button>' + delBtn("noteDel", id) + "</div></form>");
  }
  function dateForm(id) {
    var x = id ? obj(D().dates)[id] : { emoji: "🎂", yearly: true, d: today() };
    openSheet('<form data-f="date" data-id="' + esc(id || "") + '" class="form"><h2>' + (id ? "Datum aanpassen" : "Belangrijke datum") + "</h2>" +
      '<label>Wat is er?<input name="title" required maxlength="40" value="' + esc(x.title || "") + '" placeholder="Bijvoorbeeld: Oma jarig"></label>' +
      '<div class="lbl">Plaatje</div>' + emoPick("emoji", EM_D, x.emoji) +
      '<label>Datum<input type="date" name="d" required value="' + esc(x.d || today()) + '"></label>' +
      '<label class="chk"><input type="checkbox" name="yearly"' + (x.yearly ? " checked" : "") + "> Elk jaar (verjaardag). Vul dan het geboortejaar in, dan zie je de leeftijd.</label>" +
      '<div class="acts"><button class="btn wide">Opslaan</button>' + delBtn("dateDel", id) + "</div></form>");
  }
  var askCb = null;
  function ask(title, label, val, type, cb, hint) {
    askCb = cb;
    openSheet('<form data-f="ask" class="form"><h2>' + title + "</h2>" + (hint ? '<p class="mut">' + hint + "</p>" : "") + "<label>" + label +
      '<input name="v" ' + (type === "money" ? 'inputmode="decimal" placeholder="0,00"' : type === "num" ? 'type="number" inputmode="numeric" min="1" max="1000"' : 'maxlength="30"') + ' value="' + esc(val) + '"></label><div class="acts"><button class="btn wide">Opslaan</button></div></form>');
  }

  /* ---------- acties (knoppen) ---------- */
  var ACT = {
    close: closeSheet,
    g: function (d) { V.gate = d.g; render(true); },
    gLocal: function () { Store.setLocal(); },
    acc: function (d) { var f = app.querySelector("form"); if (f) V.email = f.email.value; V.acc = d.k; render(true); },
    gReset: function () { Store.resetCfg(); V.gate = "cloud"; render(true); },
    forgotPw: function () {
      var f = app.querySelector("form"), email = f ? f.email.value.trim() : "";
      if (!email) { toast("Vul eerst het e-mailadres in"); return; }
      Store.resetPw(email).then(function () { toast("Je krijgt een e-mail om het wachtwoord te herstellen"); }, function (e) { toast(Store.errNl(e)); });
    },
    retry: function () { Store.reconnect(); render(true); },
    signOut: function (d, el) {
      if (Store.pending && !sure(el)) { toast(Store.pending + " wijziging(en) zijn nog niet opgeslagen"); return; }
      lsSet("thuis.who", null); V.who = null; V.acc = "login"; Store.signOut();
    },
    copyRules: function () { copyText(RULES).then(function () { toast("Regels gekopieerd"); }); },
    pick: function (d) { var p = P(d.id); if (!p) return; if (p.pin) openPin(p); else setWho(p.id); },
    pk: function (d) { pinKey(d.k); },
    pinForgot: function () {
      var p = pin.p; if (!p || pin.mode !== "check") return;
      if (p.role === "kind") { toast("Vraag " + bossName() + " om je pincode"); return; }
      if (Store.mode !== "cloud") { pin = { buf: "", p: p, mode: "new", first: "" }; setSheet(pinHtml()); return; }
      setSheet('<form data-f="reauth" class="form"><h2>Pincode vergeten</h2><p class="mut">Vul het wachtwoord van het gezinsaccount in. Daarna kies je een nieuwe pincode.</p><label>Wachtwoord van ' + esc(Store.email) + '<input type="password" name="pw" required autocomplete="current-password"></label><p class="err" role="alert"></p><div class="acts"><button class="btn wide">Verder</button></div></form>');
    },
    switch: function () { closeSheet(); V.who = null; lsSet("thuis.who", null); render(); window.scrollTo(0, 0); },
    tab: function (d) { closeSheet(); go(d.t); },
    ktab: function (d) { V.ktab = d.k; render(); window.scrollTo(0, 0); },
    wk: function (d) { V.week = d.n === "0" ? 0 : V.week + int(d.n); render(); },
    mon: function (d) { V.month = addMonth(V.month, int(d.n)); render(); },
    geld: function (d) { V.geld = d.k; render(); },
    step: function (d, el) {
      var inp = el.parentNode.querySelector("input"); if (!inp) return;
      inp.value = clamp(int(inp.value) + int(d.n), int(inp.min), int(inp.max, 9999));
      inp.dispatchEvent(new Event("input", { bubbles: true }));
    },
    fillWhy: function (d, el) { var f = el.closest("form"); if (f && f.why) f.why.value = d.v; },
    say: function (d) { say(d.s); },

    ptog: function (d) {
      if (d.d > today()) return;
      var r = doneOf(d.d, d.t, d.p);
      if (r && r.st === "ok") { Store.multi(doneMulti(d.d, d.t, d.p, null)); toast("Teruggezet naar nog doen"); }
      else { V.pop = d.d + d.t + d.p; Store.multi(doneMulti(d.d, d.t, d.p, "ok")); }
    },
    ktog: function (d) {
      var k = me(), ds = today(), t = obj(D().tasks)[d.t]; if (!k || !t) return;
      var r = doneOf(ds, d.t, k.id);
      V.pop = ds + d.t + k.id;
      if (!r) {
        if (approveOn()) { Store.multi(doneMulti(ds, d.t, k.id, "wacht")); toast("Goed zo! " + bossName() + " kijkt het na ⏳"); }
        else { Store.multi(doneMulti(ds, d.t, k.id, "ok")); toast(t.stars ? "Goed zo! +" + t.stars + " ⭐" : "Goed zo!"); }
      } else if (r.st === "wacht") { Store.multi(doneMulti(ds, d.t, k.id, null)); toast("Weer op nog doen gezet"); }
      else toast("Dit klusje is al goedgekeurd ✓");
    },
    apOk: function (d) {
      if (d.k === "t") { Store.multi(doneMulti(d.d, d.t, d.p, "ok")); toast("Goedgekeurd"); }
      else if (approveReq(d.id)) toast("Beloning goedgekeurd 🎁");
    },
    apNo: function (d) {
      if (d.k === "t") { Store.multi(doneMulti(d.d, d.t, d.p, null)); toast("Teruggezet naar nog doen"); }
      else { Store.put("reqs/" + d.id, null); toast("Beloning niet goedgekeurd"); }
    },
    apAll: function () {
      var m = { __spent: {} }, n = 0;
      approvals().forEach(function (x) {
        if (x.type === "t") { doneMulti(x.ds, x.tid, x.pid, "ok", m); n++; }
        else if (approveReq(x.id, m)) n++;
      });
      delete m.__spent;
      Store.multi(m); toast(n + " goedgekeurd");
    },
    reqCancel: function (d) { Store.put("reqs/" + d.id, null); },
    kreq: function (d) {
      var k = me(), r = obj(D().rewards)[d.id]; if (!k || !r) return;
      var avail = starBal(k.id) - reqs(k.id).reduce(function (a, x) { return a + (+x.cost || 0); }, 0);
      if (avail < r.cost) { toast("Nog " + (r.cost - Math.max(avail, 0)) + " sterren sparen!"); say("Nog " + (r.cost - Math.max(avail, 0)) + " sterren sparen"); return; }
      openSheet('<div class="kconfirm"><div class="kbig">' + esc(r.emoji || "🎁") + "</div><h2>" + esc(r.title) + "?</h2><p>Dit kost ⭐ " + r.cost + '</p><div class="acts"><button class="btn wide big" data-a="kreqOk" data-id="' + esc(d.id) + '">Ja, kies ik!</button><button class="btn wide ghost big" data-a="close">Nee, toch niet</button></div></div>');
    },
    kreqOk: function (d) {
      var k = me(), r = obj(D().rewards)[d.id]; if (!k || !r) return;
      Store.put("reqs/" + Store.id(), { pid: k.id, rid: d.id, title: r.title, emoji: r.emoji || "🎁", cost: +r.cost, at: Date.now() });
      closeSheet(); toast("Gekozen! " + bossName() + " kijkt ernaar 🎁");
    },

    taskNew: function () { taskForm(); },
    taskEdit: function (d) { taskForm(d.id); },
    taskDel: function (d, el) { if (!sure(el)) return; Store.put("tasks/" + d.id, null); closeSheet(); toast("Klusje verwijderd"); },
    rewEdit: function (d) { rewForm(d.id); },
    rewDel: function (d, el) { if (!sure(el)) return; Store.put("rewards/" + d.id, null); closeSheet(); },
    profNew: function (d) { profForm(null, d.r); },
    profEdit: function (d) { profForm(d.id); },
    profDel: function (d, el) {
      if (!sure(el)) return;
      var m = {}; m["profiles/" + d.id] = null; m["stars/" + d.id] = null; m["pot/" + d.id] = null;
      reqs(d.id).forEach(function (r) { m["reqs/" + r.id] = null; });
      Store.multi(m); closeSheet(); toast("Verwijderd");
    },
    starAdj: function (d) { starForm(d.p, int(d.n)); },
    convert: function (d) { convertForm(d.p); },
    starHist: function (d) { histSheet("stars", d.p); },
    potHist: function (d) { histSheet("pot", d.p); },
    histDel: function (d, el) {
      if (!sure(el)) return;
      Store.put((d.k === "stars" ? "stars/" : "pot/") + d.p + "/" + d.id, null);
      histSheet(d.k, d.p);
    },
    potAdj: function (d) { potForm(d.p, int(d.n)); },
    goal: function (d) { goalForm(d.p); },
    goalDel: function (d) { Store.put("profiles/" + d.p + "/goal", null); closeSheet(); },
    wg: function (d) { wgForm(d.p); },
    expEdit: function (d) { expForm(d.id); },
    expDel: function (d, el) { if (!sure(el)) return; Store.put("exp/" + d.id, null); closeSheet(); },
    noteEdit: function (d) { noteForm(d.id); },
    noteDel: function (d, el) { if (!sure(el)) return; Store.put("board/" + d.id, null); closeSheet(); },
    dateEdit: function (d) { dateForm(d.id); },
    dateDel: function (d, el) { if (!sure(el)) return; Store.put("dates/" + d.id, null); closeSheet(); },
    datesClean: function () {
      var m = {}, lim = addD(today(), -1);
      list(D().dates).forEach(function (x) { if (!x.yearly && x.d && x.d < lim) m["dates/" + x.id] = null; });
      Store.multi(m); toast("Opgeruimd");
    },
    starter: function () {
      var ks = kids().map(function (k) { return k.id; });
      if (!ks.length) { toast("Voeg eerst een kind toe"); profForm(null, "kind"); return; }
      var m = {}, t0 = Date.now(), st = monday(today());
      [["Tanden poetsen", "🪥", 1, "ochtend"], ["Aankleden", "👕", 1, "ochtend"], ["Bed opmaken", "🛏️", 1, "ochtend"], ["Tafel dekken", "🍽️", 2, "middag", "beurt"], ["Speelgoed opruimen", "🧸", 2, "avond"], ["Tanden poetsen", "🪥", 1, "avond"]]
        .forEach(function (x, i) {
          m["tasks/" + Store.id() + i] = { title: x[0], emoji: x[1], stars: x[2], part: x[3], people: ks, mode: x[4] && ks.length > 1 ? "beurt" : "samen", rot: "dag", days: [1, 2, 3, 4, 5, 6, 7], start: st, at: t0 + i };
        });
      Store.multi(m); toast("Voorbeeldklusjes toegevoegd. Pas ze gerust aan.");
    },
    starterRew: function () {
      var m = {};
      [["Extra voorleesverhaal", "📖", 5], ["Samen een spelletje", "🎲", 8], ["IJsje", "🍦", 12], ["Film kijken", "🎬", 15], ["Later naar bed", "🌙", 20], ["Naar de speeltuin", "🛝", 30]]
        .forEach(function (x, i) { m["rewards/" + Store.id() + i] = { title: x[0], emoji: x[1], cost: x[2] }; });
      Store.multi(m); toast("Voorbeeldbeloningen toegevoegd");
    },
    togApprove: function () { Store.put("settings/approve", !approveOn()); },
    askName: function () { ask("Naam van het gezin", "Naam", cfg().name || "Thuis", "text", function (v) { Store.put("settings/name", String(v).trim() || "Thuis"); }); },
    askRate: function () {
      ask("Sterren per euro", "Hoeveel sterren is € 1,00?", rate(), "num", function (v) {
        var n = int(v); if (n < 1) { toast("Vul een getal in"); return false; } Store.put("settings/rate", n);
      }, "Als je sterren omzet naar de spaarpot.");
    },
    askBudget: function () {
      ask("Maandbudget", "Bedrag per maand", moneyVal(cfg().budget), "money", function (v) {
        var c = v ? cents(v) : 0; if (isNaN(c) || c < 0) { toast("Vul een bedrag in"); return false; } Store.put("settings/budget", c || null);
      }, "Voor uitgaven aan de kinderen en het gezin.");
    },
    shareLink: function () {
      var url = linkUrl(), text = "Koppel je telefoon aan ons gezin in Thuis. Log daarna in met " + Store.email + ".";
      var sh = plug("Share");
      if (sh) { sh.share({ title: "Thuis koppelen", text: text, url: url }).catch(function () {}); return; }
      if (navigator.share) { navigator.share({ title: "Thuis koppelen", text: text, url: url }).catch(function () {}); return; }
      ACT.copyLink();
    },
    copyLink: function () { copyText(linkUrl()).then(function (ok) { toast(ok ? "Link gekopieerd" : "Kopiëren lukte niet"); }); },
    goCloud: function () { V.gate = "cloud"; Store.resetCfg(); render(true); },
    wipeLocal: function (d, el) { if (!sure(el)) return; Store.wipeLocal(); lsSet("thuis.who", null); V.who = null; render(true); }
  };

  /* ---------- formulieren versturen ---------- */
  var FORM = {
    gcloud: function (f, fd) {
      var db = Store.normDb(fd.get("db")), key = String(fd.get("key") || "").trim(), err = f.querySelector(".err");
      if (!Store.validDb(db)) { err.textContent = "Dit lijkt geen databaseURL. Hij eindigt op firebaseio.com of firebasedatabase.app."; return; }
      if (!/^[A-Za-z0-9_-]{20,}$/.test(key)) { err.textContent = "Dit lijkt geen Web API-sleutel (begint meestal met AIza)."; return; }
      V.acc = "nieuw"; Store.setCloud(db, key);
    },
    glink: function (f, fd) {
      var c = Store.parseLink(fd.get("link"));
      if (!c) { f.querySelector(".err").textContent = "Deze link herken ik niet. Kopieer de hele link."; return; }
      V.email = c.email; V.acc = "login"; Store.setCloud(c.db, c.key);
    },
    gacc: function (f, fd) {
      var email = String(fd.get("email") || "").trim(), pw = String(fd.get("pw") || ""), nieuw = V.acc === "nieuw" && !Store.lost, err = f.querySelector(".err");
      err.textContent = "";
      if (nieuw && pw !== fd.get("pw2")) { err.textContent = "De wachtwoorden zijn niet gelijk."; return; }
      V.email = email; busy(f, true);
      (nieuw ? Store.signUp(email, pw, !!fd.get("carry")) : Store.signIn(email, pw)).then(function () { render(true); }, function (e) { busy(f, false); err.textContent = Store.errNl(e); });
    },
    first: function (f, fd) {
      var err = f.querySelector(".err"), code = String(fd.get("pin") || "");
      if (!/^\d{4}$/.test(code)) { err.textContent = "De pincode moet 4 cijfers zijn."; return; }
      if (code !== fd.get("pin2")) { err.textContent = "De pincodes zijn niet gelijk."; return; }
      var id = Store.id();
      hashPin(id, code).then(function (h) {
        var m = {};
        m["profiles/" + id] = { name: String(fd.get("name")).trim(), role: "ouder", emoji: emoVal(fd, "emoji", "🙂"), color: fd.get("color") || COLORS[0], pin: h, order: Date.now() };
        if (!cfg().rate) m["settings"] = Object.assign({ approve: true, rate: 10, name: "Thuis" }, cfg());
        Store.multi(m);
        setWho(id);
        setTimeout(function () { profForm(null, "kind"); }, 250);
      });
    },
    reauth: function (f, fd) {
      var err = f.querySelector(".err"), p = pin.p; busy(f, true);
      Store.reauth(String(fd.get("pw") || "")).then(function () { pin = { buf: "", p: p, mode: "new", first: "" }; setSheet(pinHtml()); },
        function (e) { busy(f, false); err.textContent = Store.errNl(e); });
    },
    task: function (f, fd) {
      var title = String(fd.get("title") || "").trim(); if (!title) return;
      var people = fd.getAll("people"); if (!people.length) { toast("Kies wie het klusje doet"); return; }
      var when = fd.get("when"), days = fd.getAll("days").map(Number).sort();
      if (when === "herhaal" && !days.length) { toast("Kies minstens één dag"); return; }
      var id = f.dataset.id || Store.id(), old = obj(obj(D().tasks)[id]);
      Store.put("tasks/" + id, {
        title: title, emoji: emoVal(fd, "emoji", "✅"), stars: clamp(int(fd.get("stars")), 0, 50), people: people,
        mode: people.length > 1 ? fd.get("mode") || "samen" : "samen", rot: fd.get("rot") || "dag",
        days: when === "herhaal" ? days : null, once: when === "eenmalig" ? fd.get("once") || today() : null,
        part: fd.get("part") || "", start: old.start || monday(today()), at: old.at || Date.now()
      });
      closeSheet(); toast(f.dataset.id ? "Opgeslagen" : "Klusje toegevoegd");
    },
    rew: function (f, fd) {
      var id = f.dataset.id || Store.id();
      Store.put("rewards/" + id, { title: String(fd.get("title")).trim(), emoji: emoVal(fd, "emoji", "🎁"), cost: clamp(int(fd.get("cost"), 1), 1, 9999) });
      closeSheet();
    },
    prof: function (f, fd) {
      var id = f.dataset.id || Store.id(), old = obj(obj(D().profiles)[id]), role = fd.get("role") === "ouder" ? "ouder" : "kind";
      var code = String(fd.get("pin") || "");
      if (code && !/^\d{4}$/.test(code)) { toast("De pincode moet 4 cijfers zijn"); return; }
      var hp = code ? hashPin(id, code) : Promise.resolve(role === "kind" && fd.get("nopin") ? "" : old.pin || "");
      hp.then(function (h) {
        if (role === "ouder" && !h) { toast("Een ouder heeft een pincode nodig"); return; }
        var p = Object.assign({}, old, { name: String(fd.get("name")).trim(), role: role, emoji: emoVal(fd, "emoji", "🙂"), color: fd.get("color") || old.color || COLORS[0], pin: h || null, order: old.order || Date.now() });
        Store.put("profiles/" + id, p);
        closeSheet(); toast(f.dataset.id ? "Opgeslagen" : p.name + " is toegevoegd");
      });
    },
    stars: function (f, fd) {
      var n = clamp(int(fd.get("n")), 1, 1000) * int(f.dataset.s), why = String(fd.get("why") || "").trim() || (n > 0 ? "Bonus" : "Afgehaald");
      Store.put("stars/" + f.dataset.p + "/" + Store.id(), { n: n, why: (n > 0 ? "🌟 " : "") + why, at: Date.now(), by: V.who });
      closeSheet(); toast((n > 0 ? "+" : "") + n + " ⭐");
    },
    convert: function (f, fd) {
      var pid = f.dataset.p, bal = starBal(pid);
      if (bal < 1) { closeSheet(); return; }
      var n = clamp(int(fd.get("n")), 1, bal), c = Math.round(n / rate() * 100), id = "c_" + Store.id(), m = {};
      m["stars/" + pid + "/" + id] = { n: -n, why: "🐷 Naar de spaarpot", at: Date.now() };
      m["pot/" + pid + "/" + id] = { c: c, why: "⭐ " + n + " sterren omgezet", at: Date.now() };
      Store.multi(m); closeSheet(); toast(euro(c) + " in de spaarpot");
    },
    pot: function (f, fd) {
      var c = cents(fd.get("c")); if (!(c > 0)) { toast("Vul een bedrag in"); return; }
      var sign = int(f.dataset.s), why = String(fd.get("why") || "").trim() || (sign > 0 ? "Erbij" : "Uitgegeven");
      Store.put("pot/" + f.dataset.p + "/" + Store.id(), { c: c * sign, why: why, at: Date.now() });
      closeSheet();
    },
    goal: function (f, fd) {
      var c = cents(fd.get("c")); if (!(c > 0)) { toast("Vul een bedrag in"); return; }
      Store.put("profiles/" + f.dataset.p + "/goal", { name: String(fd.get("name")).trim(), emoji: emoVal(fd, "emoji", "🎯"), c: c });
      closeSheet();
    },
    wg: function (f, fd) {
      var v = String(fd.get("c") || "").trim(), c = v ? cents(v) : 0;
      if (isNaN(c) || c < 0) { toast("Vul een bedrag in"); return; }
      var pid = f.dataset.p, k = P(pid), m = {};
      m["profiles/" + pid + "/weekgeld"] = c || null;
      m["profiles/" + pid + "/wgStart"] = c ? (k.weekgeld > 0 && k.wgStart ? k.wgStart : weekKey(today())) : null;
      Store.multi(m); maintDone = false; closeSheet();
      toast(c ? "Weekgeld " + euro(c) + " ingesteld" : "Geen weekgeld meer");
    },
    exp: function (f, fd) {
      var c = cents(fd.get("c")); if (!(c > 0)) { toast("Vul een bedrag in"); return; }
      var id = f.dataset.id || Store.id(), old = obj(obj(D().exp)[id]);
      Store.put("exp/" + id, { c: c, cat: fd.get("cat") || "overig", who: fd.get("who") || "gezin", d: fd.get("d") || today(), note: String(fd.get("note") || "").trim(), by: old.by || V.who, at: old.at || Date.now() });
      V.month = String(fd.get("d") || today()).slice(0, 7);
      closeSheet();
    },
    note: function (f, fd) {
      var id = f.dataset.id || Store.id(), old = obj(obj(D().board)[id]);
      Store.put("board/" + id, { text: String(fd.get("text")).trim(), emoji: emoVal(fd, "emoji", "📌"), color: fd.get("color") || NOTES[0], pin: !!fd.get("pin"), by: old.by || V.who, at: old.at || Date.now() });
      closeSheet();
    },
    date: function (f, fd) {
      var id = f.dataset.id || Store.id();
      Store.put("dates/" + id, { title: String(fd.get("title")).trim(), emoji: emoVal(fd, "emoji", "📅"), d: fd.get("d"), yearly: !!fd.get("yearly") });
      closeSheet();
    },
    ask: function (f, fd) { var cb = askCb; if (cb && cb(fd.get("v")) === false) return; closeSheet(); }
  };

  /* ---------- gebeurtenissen ---------- */
  document.addEventListener("click", function (ev) {
    var el = ev.target.closest("[data-a]"); if (!el || el.disabled) return;
    var fn = ACT[el.getAttribute("data-a")];
    if (fn) { ev.preventDefault(); fn(el.dataset, el, ev); }
  });
  document.addEventListener("submit", function (ev) {
    var f = ev.target, fn = FORM[f.getAttribute("data-f")];
    if (fn) { ev.preventDefault(); fn(f, new FormData(f)); }
  });
  document.addEventListener("change", function (ev) {
    if (sheetEl.contains(ev.target)) syncIf();
    // Eigen emoji: typen selecteert automatisch het eigen-vakje
  });
  document.addEventListener("input", function (ev) {
    var t = ev.target;
    if (/Own$/.test(t.name || "")) { var r = t.closest("label").querySelector('input[type="radio"]'); if (r) r.checked = true; }
    var f = t.form;
    if (f && f.getAttribute("data-f") === "convert" && t.name === "n") {
      var out = f.querySelector("[data-out]"); if (out) out.textContent = euro(Math.round(clamp(int(t.value), 0, 1e6) / rate() * 100));
    }
  });
  document.addEventListener("keydown", function (ev) {
    if (sheetEl.hidden) return;
    if (ev.key === "Escape") { closeSheet(); return; }
    if (pin.p && sheetEl.querySelector(".pinpad")) {
      if (/^[0-9]$/.test(ev.key)) { ev.preventDefault(); pinKey(ev.key); }
      else if (ev.key === "Backspace") { ev.preventDefault(); pinKey("del"); }
    }
  });

  var App = plug("App");
  if (App) App.addListener("backButton", function () {
    if (!sheetEl.hidden) { closeSheet(); return; }
    var m = me();
    if (m && m.role !== "kind" && V.tab !== "home") { go("home"); return; }
    if (m && m.role === "kind" && V.ktab !== "klus") { V.ktab = "klus"; render(); return; }
    if (App.minimizeApp) App.minimizeApp(); else App.exitApp();
  });

  /* ---------- starten ---------- */
  Store.on(schedule);
  Store.onError(function (msg) { toast(msg); });
  Store.init();
  if (location.hash.indexOf("koppel=") >= 0) {
    var c = Store.parseLink(location.hash);
    if (c && !(Store.authed && Store.cfg && Store.cfg.db === Store.normDb(c.db))) { V.email = c.email; V.acc = "login"; Store.setCloud(c.db, c.key); }
    try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
  }
  setInterval(function () { if (!gateKey() && sheetEl.hidden) render(); }, 60000);
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") { maintDone = false; schedule(); } });
  render(true);
  if (window.speechSynthesis && speechSynthesis.getVoices) speechSynthesis.getVoices();
})();
