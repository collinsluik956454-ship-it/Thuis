/* Thuis – opslag en synchronisatie.
   Bewaart alles op dit toestel en, als er een gezinsaccount is, ook in Firebase Realtime Database.
   Wijzigingen gaan eerst lokaal (werkt ook offline) en worden daarna verstuurd. */
(function () {
  "use strict";

  var LS = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) {} }
  };
  var K = { cfg: "thuis.cfg", auth: "thuis.auth", local: "thuis.data.local" };

  var cfg = LS.get(K.cfg, null);
  var auth = LS.get(K.auth, null);
  var data = {}, outbox = [], ready = false;
  var status = "", statusMsg = "";
  var es = null, retryT = null, refreshT = null, saveT = null, flushT = null;
  var flushing = false, refreshing = null, listeners = [];

  function isCloud() { return !!(cfg && cfg.mode === "cloud"); }
  function dataKey() { return isCloud() && auth ? "thuis.data." + auth.uid : K.local; }
  function boxKey() { return "thuis.box." + (auth ? auth.uid : "x"); }

  function emit() { listeners.forEach(function (f) { try { f(); } catch (e) { console.error(e); } }); }
  function save() { clearTimeout(saveT); saveT = setTimeout(function () { LS.set(dataKey(), data); }, 120); }
  function setStatus(s, msg) { if (s === status && (msg || "") === statusMsg) return; status = s; statusMsg = msg || ""; emit(); }

  /* ---------- boom-hulpjes ---------- */
  function clone(v) { return v == null ? null : JSON.parse(JSON.stringify(v)); }
  function parts(p) { return String(p || "").split("/").filter(Boolean); }
  function joinP(a, b) { return parts(a).concat(parts(b)).join("/"); }
  function setAt(root, p, val) {
    var ps = parts(p);
    if (!ps.length) return val && typeof val === "object" ? clone(val) : {};
    var o = root, stack = [];
    for (var i = 0; i < ps.length - 1; i++) {
      if (!o[ps[i]] || typeof o[ps[i]] !== "object") {
        if (val == null) return root;
        o[ps[i]] = {};
      }
      stack.push([o, ps[i]]);
      o = o[ps[i]];
    }
    var last = ps[ps.length - 1];
    if (val == null) {
      delete o[last];
      for (var j = stack.length - 1; j >= 0; j--) {
        var pr = stack[j];
        if (Object.keys(pr[0][pr[1]]).length === 0) delete pr[0][pr[1]]; else break;
      }
    } else o[last] = clone(val);
    return root;
  }
  function applyEntry(e) {
    if (e.m) { for (var k in e.m) data = setAt(data, k, e.m[k]); }
    else data = setAt(data, e.p, e.v);
  }

  /* ---------- schrijven ---------- */
  function put(p, v) {
    var e = { p: p, v: v === undefined ? null : clone(v) };
    applyEntry(e); save(); emit(); queue(e);
  }
  function multi(m) {
    var mm = {}, n = 0;
    for (var k in m) { mm[k] = m[k] === undefined ? null : clone(m[k]); n++; }
    if (!n) return;
    var e = { m: mm };
    applyEntry(e); save(); emit(); queue(e);
  }
  function queue(e) {
    if (!isCloud() || !auth) return;
    outbox.push(e); LS.set(boxKey(), outbox); flush();
  }

  /* ---------- REST ---------- */
  function base() { return cfg.db + "/families/" + auth.uid; }
  function errMsg(j) { return j && j.error ? (j.error.message || (typeof j.error === "string" ? j.error : "")) : ""; }
  function api(url, opts) {
    return fetch(url, opts).then(function (r) {
      return r.text().then(function (t) {
        var j = null;
        try { j = t ? JSON.parse(t) : null; } catch (e) {}
        if (!r.ok) { var err = new Error(errMsg(j) || "HTTP " + r.status); err.status = r.status; throw err; }
        return j;
      });
    });
  }
  function tokenOk() { return auth && auth.token && Date.now() < (auth.exp || 0) - 60000; }
  function ensureToken() { return tokenOk() ? Promise.resolve(auth.token) : refreshToken(); }
  function refreshToken() {
    if (refreshing) return refreshing;
    if (!auth || !auth.refresh) return Promise.reject(new Error("Niet ingelogd"));
    refreshing = api("https://securetoken.googleapis.com/v1/token?key=" + encodeURIComponent(cfg.key), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "grant_type=refresh_token&refresh_token=" + encodeURIComponent(auth.refresh)
    }).then(function (j) {
      refreshing = null;
      auth.token = j.id_token; auth.refresh = j.refresh_token || auth.refresh;
      auth.exp = Date.now() + (+j.expires_in || 3600) * 1000;
      LS.set(K.auth, auth);
      return auth.token;
    }, function (e) {
      refreshing = null;
      if (e.status === 400 || e.status === 403) { auth.lost = true; LS.set(K.auth, auth); disconnect(); setStatus("afgemeld"); }
      throw e;
    });
    return refreshing;
  }

  /* ---------- live verbinding ---------- */
  function disconnect() { if (es) { es.close(); es = null; } clearTimeout(refreshT); clearTimeout(retryT); }
  function retryLater(ms) {
    if (status !== "geweigerd" && status !== "fout" && status !== "afgemeld") setStatus("offline");
    clearTimeout(retryT); retryT = setTimeout(connect, ms || 15000);
  }
  function connect() {
    disconnect();
    if (!isCloud() || !auth || auth.lost) return;
    if (status !== "online") setStatus("verbinden");
    ensureToken().then(function (tok) {
      var src = new EventSource(base() + ".json?auth=" + encodeURIComponent(tok));
      es = src;
      src.addEventListener("put", function (ev) { remote(ev.data, false); });
      src.addEventListener("patch", function (ev) { remote(ev.data, true); });
      src.addEventListener("cancel", function () { disconnect(); setStatus("geweigerd"); });
      src.addEventListener("auth_revoked", function () { disconnect(); refreshToken().then(connect, function () { retryLater(); }); });
      src.onopen = function () { setStatus("online"); flush(); };
      src.onerror = function () {
        if (es !== src) return;
        if (src.readyState === 2) { es = null; probe(); } else setStatus("offline");
      };
      refreshT = setTimeout(function () { refreshToken().then(connect, function () { retryLater(); }); },
        Math.max(60000, (auth.exp || 0) - Date.now() - 120000));
    }, function () { retryLater(); });
  }
  // Waarom ging de verbinding dicht? Kijk met een gewone aanvraag.
  function probe() {
    ensureToken().then(function (tok) {
      return fetch(base() + ".json?shallow=true&auth=" + encodeURIComponent(tok)).then(function (r) {
        return r.text().then(function (t) {
          var j = null; try { j = JSON.parse(t); } catch (e) {}
          var m = errMsg(j);
          if (r.ok) return retryLater(3000);
          if (r.status === 401 && /expired/i.test(m)) return refreshToken().then(connect);
          if (r.status === 401 || r.status === 403) return setStatus("geweigerd");
          if (r.status === 404) return setStatus("fout", "Database niet gevonden. Controleer het databaseadres.");
          if (r.status === 423) return setStatus("fout", "De database is uitgeschakeld in Firebase.");
          retryLater();
        });
      });
    }).catch(function () { retryLater(); });
  }
  function remote(raw, isPatch) {
    var m; try { m = JSON.parse(raw); } catch (e) { return; }
    if (!m) return;
    if (isPatch) { for (var k in (m.data || {})) data = setAt(data, joinP(m.path, k), m.data[k]); }
    else data = setAt(data, m.path, m.data);
    if (outbox.length) outbox.forEach(applyEntry);
    if (status !== "online") status = "online";
    ready = true;
    save(); emit();
  }

  function flush() {
    clearTimeout(flushT);
    if (flushing || !outbox.length || !isCloud() || !auth || auth.lost) return;
    flushing = true;
    var e = outbox[0];
    ensureToken().then(function (tok) {
      var q = ".json?auth=" + encodeURIComponent(tok);
      if (e.m) return api(base() + q, { method: "PATCH", body: JSON.stringify(e.m) });
      var url = (parts(e.p).length ? base() + "/" + parts(e.p).join("/") : base()) + q;
      return api(url, e.v == null ? { method: "DELETE" } : { method: "PUT", body: JSON.stringify(e.v) });
    }).then(function () {
      flushing = false; outbox.shift(); LS.set(boxKey(), outbox); emit(); flush();
    }, function (err) {
      flushing = false;
      if (err.status === 401 && /expired/i.test(err.message)) { refreshToken().then(flush, function () {}); return; }
      if (err.status === 401 || err.status === 403) { setStatus("geweigerd"); return; }
      if (err.status >= 400 && err.status < 500) {
        outbox.shift(); LS.set(boxKey(), outbox);
        report("Opslaan mislukt: " + err.message); flush(); return;
      }
      if (status === "online") setStatus("offline");
      flushT = setTimeout(flush, 15000);
    });
  }
  var errFns = [];
  function report(msg) { errFns.forEach(function (f) { f(msg); }); }

  /* ---------- account ---------- */
  function idt(method, body) {
    return api("https://identitytoolkit.googleapis.com/v1/accounts:" + method + "?key=" + encodeURIComponent(cfg.key), {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
    });
  }
  function setAuth(j) {
    var same = auth && auth.uid === j.localId;
    auth = { uid: j.localId, email: j.email, token: j.idToken, refresh: j.refreshToken, exp: Date.now() + (+j.expiresIn || 3600) * 1000 };
    LS.set(K.auth, auth);
    if (!same) { data = LS.get(dataKey(), {}) || {}; outbox = LS.get(boxKey(), []) || []; ready = false; }
  }
  function signIn(email, pw) {
    return idt("signInWithPassword", { email: email, password: pw, returnSecureToken: true })
      .then(function (j) { setAuth(j); status = ""; connect(); emit(); });
  }
  function signUp(email, pw, carry) {
    var local = carry ? LS.get(K.local, null) : null;
    return idt("signUp", { email: email, password: pw, returnSecureToken: true }).then(function (j) {
      setAuth(j); status = "";
      if (local && Object.keys(local).length) {
        data = local; ready = true; save();
        outbox.push({ p: "", v: local }); LS.set(boxKey(), outbox);
      }
      connect(); emit();
    });
  }
  function reauth(pw) {
    return idt("signInWithPassword", { email: auth.email, password: pw, returnSecureToken: true })
      .then(function (j) { setAuth(j); return true; });
  }
  function resetPw(email) { return idt("sendOobCode", { requestType: "PASSWORD_RESET", email: email }); }
  function signOut() {
    disconnect();
    if (auth) { LS.del(dataKey()); LS.del(boxKey()); }
    LS.del(K.auth); auth = null; data = {}; outbox = []; ready = false; status = "";
    emit();
  }

  /* ---------- instellingen ---------- */
  function normDb(u) {
    u = String(u || "").trim().replace(/\/+$/, "");
    if (u && !/^https?:\/\//i.test(u)) u = "https://" + u;
    return u;
  }
  function validDb(u) {
    return /^https:\/\/[a-z0-9-]+(\.[a-z0-9-]+)*\.(firebaseio\.com|firebasedatabase\.app)$/i.test(u) ||
      /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(u);
  }
  function setLocal() {
    disconnect();
    cfg = { mode: "local" }; LS.set(K.cfg, cfg);
    auth = null; LS.del(K.auth);
    data = LS.get(K.local, {}) || {}; outbox = []; ready = true; status = "local";
    emit();
  }
  function setCloud(db, key) {
    disconnect();
    cfg = { mode: "cloud", db: normDb(db), key: String(key || "").trim() }; LS.set(K.cfg, cfg);
    auth = null; LS.del(K.auth); data = {}; outbox = []; ready = false; status = "";
    emit();
  }
  function resetCfg() {
    disconnect();
    cfg = null; LS.del(K.cfg); auth = null; LS.del(K.auth); data = {}; outbox = []; ready = false; status = "";
    emit();
  }
  function wipeLocal() { LS.del(K.local); if (!isCloud()) { data = {}; save(); emit(); } }

  function b64e(s) { return btoa(unescape(encodeURIComponent(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
  function b64d(s) { s = s.replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "="; return decodeURIComponent(escape(atob(s))); }
  function linkCode() { return b64e(JSON.stringify({ d: cfg.db, k: cfg.key, e: auth ? auth.email : "" })); }
  function parseLink(str) {
    var m = String(str || "").match(/koppel=([A-Za-z0-9_-]+)/);
    if (!m) return null;
    try { var o = JSON.parse(b64d(m[1])); return o && o.d && o.k ? { db: o.d, key: o.k, email: o.e || "" } : null; }
    catch (e) { return null; }
  }

  function errNl(e) {
    var m = String((e && e.message) || e || "");
    if (/EMAIL_EXISTS/.test(m)) return "Dit e-mailadres heeft al een gezinsaccount. Kies Inloggen.";
    if (/EMAIL_NOT_FOUND|INVALID_PASSWORD|INVALID_LOGIN_CREDENTIALS/.test(m)) return "E-mailadres of wachtwoord klopt niet.";
    if (/WEAK_PASSWORD/.test(m)) return "Kies een wachtwoord van minstens 6 tekens.";
    if (/INVALID_EMAIL|MISSING_EMAIL/.test(m)) return "Dit e-mailadres is ongeldig.";
    if (/MISSING_PASSWORD/.test(m)) return "Vul een wachtwoord in.";
    if (/TOO_MANY_ATTEMPTS/.test(m)) return "Te veel pogingen. Probeer het over een paar minuten opnieuw.";
    if (/OPERATION_NOT_ALLOWED|PASSWORD_LOGIN_DISABLED/.test(m)) return "Inloggen met e-mail staat nog uit. Zet in Firebase bij Authentication → Aanmeldmethode ‘E-mail/wachtwoord’ aan.";
    if (/CONFIGURATION_NOT_FOUND/.test(m)) return "Authentication is nog niet ingeschakeld in je Firebase-project.";
    if (/API key not valid|API_KEY_INVALID/.test(m)) return "De Web API-sleutel klopt niet.";
    if (/USER_DISABLED/.test(m)) return "Dit account is uitgeschakeld.";
    if (/Failed to fetch|NetworkError|Load failed|network/i.test(m)) return "Geen verbinding. Controleer je internet.";
    return m || "Er ging iets mis.";
  }

  function id() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  function init() {
    if (cfg && cfg.mode === "local") { data = LS.get(K.local, {}) || {}; ready = true; status = "local"; }
    else if (isCloud() && auth) {
      data = LS.get(dataKey(), {}) || {}; outbox = LS.get(boxKey(), []) || [];
      ready = Object.keys(data).length > 0;
      if (!auth.lost) connect(); else status = "afgemeld";
    }
    window.addEventListener("online", function () { if (isCloud() && auth && !auth.lost) { connect(); flush(); } });
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "visible" && isCloud() && auth && !auth.lost && (!es || !tokenOk())) connect();
    });
  }

  window.Store = {
    get data() { return data; },
    get mode() { return cfg ? cfg.mode : null; },
    get cfg() { return cfg; },
    get ready() { return ready; },
    get status() { return status; },
    get statusMsg() { return statusMsg; },
    get email() { return auth ? auth.email : ""; },
    get authed() { return !!(auth && !auth.lost); },
    get lost() { return !!(auth && auth.lost); },
    get pending() { return outbox.length; },
    hasLocal: function () { var l = LS.get(K.local, null); return !!(l && Object.keys(l).length); },
    // Voor het bijwerken van de agenda op de achtergrond (Android-app): waar en als wie er geschreven mag worden.
    nativeAuth: function () { return isCloud() && auth && !auth.lost && auth.refresh ? { db: cfg.db, key: cfg.key, uid: auth.uid, refresh: auth.refresh } : null; },
    on: function (f) { listeners.push(f); },
    onError: function (f) { errFns.push(f); },
    init: init, put: put, multi: multi, id: id,
    setLocal: setLocal, setCloud: setCloud, resetCfg: resetCfg, wipeLocal: wipeLocal,
    signIn: signIn, signUp: signUp, reauth: reauth, resetPw: resetPw, signOut: signOut,
    reconnect: function () { status = ""; connect(); emit(); },
    normDb: normDb, validDb: validDb, linkCode: linkCode, parseLink: parseLink, errNl: errNl
  };
})();
