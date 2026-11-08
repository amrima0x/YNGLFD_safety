// Data layer: Firebase Realtime Database when configured, otherwise a local demo store.
(function () {
  const C = window.APP_CONFIG;
  const CAP = C.capacityPerDay;
  const FB = "https://www.gstatic.com/firebasejs/10.12.2/";
  const configured = !!(C.firebase && C.firebase.apiKey && C.firebase.databaseURL);

  const cleanId = (s) => String(s || "").toUpperCase().replace(/[^A-Z0-9-]/g, "");
  const dayCfg = (id) => C.days.find((d) => d.id === id);
  const isPast = (id) => Date.now() >= new Date(dayCfg(id).closesAt).getTime();

  // ---------------- Demo store (localStorage, this browser only) ----------------
  function demoStore() {
    const K = "ynglfd_safety_demo_v1";
    const subs = new Set();
    const load = () => { try { return JSON.parse(localStorage.getItem(K)) || {}; } catch (e) { return {}; } };
    const save = (s) => { try { localStorage.setItem(K, JSON.stringify(s)); } catch (e) {} subs.forEach((f) => f()); };
    const st = () => { const s = load(); s.reg = s.reg || {}; s.settings = s.settings || {}; return s; };
    const pub = () => {
      const s = st(); const counts = {};
      C.days.forEach((d) => (counts[d.id] = { n: Object.keys(s.reg[d.id] || {}).length }));
      return { counts, settings: s.settings };
    };
    window.addEventListener("storage", () => subs.forEach((f) => f()));
    return {
      mode: "demo",
      watchPublic(cb) { const f = () => cb(pub()); subs.add(f); f(); return () => subs.delete(f); },
      async register(day, f) {
        await new Promise((r) => setTimeout(r, 600));
        const s = st(); const emp = cleanId(f.empId);
        if (isPast(day) || (s.settings[day] && s.settings[day].open === false)) return { ok: false, reason: "closed" };
        const other = C.days.filter((d) => d.id !== day);
        if ((s.reg[day] || {})[emp] || other.some((d) => (s.reg[d.id] || {})[emp])) return { ok: false, reason: "duplicate" };
        const n = Object.keys(s.reg[day] || {}).length;
        if (n >= CAP) return { ok: false, reason: "full" };
        s.reg[day] = s.reg[day] || {};
        s.reg[day][emp] = { name: f.name, empId: emp, company: f.company, email: f.email || "", ts: Date.now(), seat: n + 1, lang: f.lang };
        save(s);
        return { ok: true, seat: n + 1 };
      },
      async signIn() { this._signed = true; subs.forEach((f) => f()); },
      async signOut() { this._signed = false; subs.forEach((f) => f()); },
      onAuth(cb) { const f = () => cb(this._signed ? { email: "demo@local" } : null); subs.add(f); f(); },
      watchAll(cb) { const f = () => cb(st().reg); subs.add(f); f(); },
      async remove(day, emp) { const s = st(); if (s.reg[day]) delete s.reg[day][emp]; save(s); },
      async setOpen(day, open) { const s = st(); s.settings[day] = { open }; save(s); },
      async resetDemo() { localStorage.removeItem(K); subs.forEach((f) => f()); }
    };
  }

  // ---------------- Firebase store ----------------
  async function firebaseStore() {
    const [appM, dbM] = await Promise.all([import(FB + "firebase-app.js"), import(FB + "firebase-database.js")]);
    const app = appM.initializeApp(C.firebase);
    const db = dbM.getDatabase(app);
    const { ref, onValue, get, update, serverTimestamp } = dbM;
    let authM = null, auth = null;
    const needAuth = async () => {
      if (!authM) { authM = await import(FB + "firebase-auth.js"); auth = authM.getAuth(app); }
      return authM;
    };
    const readPub = async () => (await get(ref(db, "public"))).val() || {};

    return {
      mode: "live",
      watchPublic(cb, onErr) {
        return onValue(ref(db, "public"), (s) => {
          const v = s.val() || {};
          cb({ counts: v.counts || {}, settings: v.settings || {} });
        }, onErr);
      },
      async register(day, f) {
        const emp = cleanId(f.empId);
        if (isPast(day)) return { ok: false, reason: "closed" };
        let lastN = -1;
        for (let attempt = 0; attempt < 6; attempt++) {
          let p;
          try { p = await readPub(); } catch (e) { return { ok: false, reason: "network" }; }
          if (p.settings && p.settings[day] && p.settings[day].open === false) return { ok: false, reason: "closed" };
          const n = (p.counts && p.counts[day] && p.counts[day].n) || 0;
          if (n >= CAP) return { ok: false, reason: "full" };
          if (n === lastN) return { ok: false, reason: isPast(day) ? "closed" : "duplicate" };
          lastN = n;
          const rec = { name: f.name, empId: emp, company: f.company, ts: serverTimestamp(), seat: n + 1, lang: f.lang };
          if (f.email) rec.email = f.email;
          const u = {};
          u["public/counts/" + day] = { n: n + 1, last: emp };
          u["registrations/" + day + "/" + emp] = rec;
          try { await update(ref(db), u); return { ok: true, seat: n + 1 }; }
          catch (e) {
            if (!/permission/i.test(String(e && (e.code || e.message)))) return { ok: false, reason: "network" };
            await new Promise((r) => setTimeout(r, 150 + Math.random() * 400));
          }
        }
        return { ok: false, reason: "busy" };
      },
      async signIn(email, pw) { const a = await needAuth(); await a.signInWithEmailAndPassword(auth, email, pw); },
      async signOut() { const a = await needAuth(); await a.signOut(auth); },
      async onAuth(cb) { const a = await needAuth(); a.onAuthStateChanged(auth, cb); },
      watchAll(cb, onErr) { return onValue(ref(db, "registrations"), (s) => cb(s.val() || {}), onErr); },
      async remove(day, emp) {
        const p = await readPub();
        const n = (p.counts && p.counts[day] && p.counts[day].n) || 1;
        const u = {};
        u["registrations/" + day + "/" + emp] = null;
        u["public/counts/" + day] = { n: Math.max(0, n - 1), last: "admin" };
        await update(ref(db), u);
      },
      async setOpen(day, open) { const u = {}; u["public/settings/" + day] = { open }; await update(ref(db), u); }
    };
  }

  window.Store = {
    configured, cleanId, isPast, dayCfg, CAP,
    async init() { return configured ? firebaseStore() : demoStore(); }
  };
})();
