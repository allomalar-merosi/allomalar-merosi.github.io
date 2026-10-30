/* Server bilan aloqa. apiUrl berilgan bo‘lsa — Google Apps Script, aks holda brauzer ichidagi sinov serveri. */
(function () {
  "use strict";

  var CFG = window.CONFIG || {};
  var TOKEN_KEY = "tarbiya.token.v1";
  var DB_KEY = "tarbiya.db.v1";

  function get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function set(key, v) { try { if (v == null) localStorage.removeItem(key); else localStorage.setItem(key, v); } catch (e) { /* xotira yopiq */ } }

  var memory = null;
  function localDb() {
    if (!memory) {
      try { memory = JSON.parse(get(DB_KEY) || "{}"); } catch (e) { memory = {}; }
    }
    return memory;
  }
  function persist() { set(DB_KEY, JSON.stringify(memory)); }

  var localStore = {
    rows: function (t) { return (localDb()[t] || []).map(function (r) { var o = {}; for (var k in r) o[k] = r[k]; return o; }); },
    add: function (t, r) { var db = localDb(); (db[t] = db[t] || []).push(r); persist(); },
    update: function (t, id, patch) {
      (localDb()[t] || []).forEach(function (r) { if (r.id === id) for (var k in patch) r[k] = patch[k]; });
      persist();
    },
    remove: function (t, id) { var db = localDb(); db[t] = (db[t] || []).filter(function (r) { return r.id !== id; }); persist(); }
  };

  var localHandle = null;
  function local(q) {
    if (!localHandle) localHandle = createCore(localStore, { now: function () { return Date.now(); }, random: Math.random });
    return new Promise(function (resolve) { setTimeout(function () { resolve(localHandle(q)); }, 60); });
  }

  function remote(q) {
    return fetch(CFG.apiUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(q),
      redirect: "follow"
    }).then(function (r) { return r.json(); }).catch(function () {
      return { ok: false, error: "Server bilan aloqa yo‘q. Internetni tekshirib, qayta urinib ko‘ring." };
    });
  }

  var API = {
    mode: CFG.apiUrl ? "remote" : "local",
    user: null,
    token: get(TOKEN_KEY),
    call: function (action, params) {
      var q = params || {};
      q.action = action;
      if (API.token) q.token = API.token;
      return (API.mode === "remote" ? remote(q) : local(q)).then(function (res) {
        if (res && res.auth === false) API.setSession(null, null);
        return res;
      });
    },
    setSession: function (token, user) {
      API.token = token;
      API.user = user;
      set(TOKEN_KEY, token);
    },
    init: function () {
      if (!API.token) return Promise.resolve(null);
      return API.call("me").then(function (r) {
        if (r.ok) API.user = r.user;
        return API.user;
      });
    }
  };

  window.API = API;
})();
