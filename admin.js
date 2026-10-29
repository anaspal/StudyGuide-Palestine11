/* StudyGuide Palestine — المحتوى الحي ووضع المدير
 * - القراءة: عامة لكل الزوار من Firebase Realtime Database (المسار /content)
 * - الكتابة: لحساب المدير فقط، والتحقق يتم بواسطة Firebase Authentication وقواعد القاعدة
 * - الدخول: الضغط على اسم المصمم في تذييل الصفحة (بدون أي زر ظاهر)
 */

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCt8-AzCx8FmM894sMQ2l7uWl0ZDOZLRE0",
  authDomain: "studyguide-palestine.firebaseapp.com",
  databaseURL: "https://studyguide-palestine-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "studyguide-palestine",
  storageBucket: "studyguide-palestine.firebasestorage.app",
  messagingSenderId: "616439408734",
  appId: "1:616439408734:web:5fd71aac560b192b1b2ccf"
};

const SDK = "https://www.gstatic.com/firebasejs/10.14.1/";
const ADMIN_DOMAIN = "studyguide.admin"; // اسم المستخدم يتحول داخلياً إلى <username>@studyguide.admin
const LS_CACHE = "sg-live-cache-v1";
const LS_ADMIN = "sg-admin-hint";
const LIMIT = 4;
const MAX_IMGS = 5;
const MAX_FILES = 3, MAX_FILE_BYTES = 10 * 1024 * 1024;
const FILE_ID = /^[-\w]{10,40}$/;
const IMG_PREFIX = "data:image/jpeg;base64,";
const IMG_ID = /^[-\w]{10,40}$/;

const SUM_KINDS = { sum: ["📝", "تلخيص", "فتح التلخيص"], file: ["📎", "ملف", "فتح الملف"], sheet: ["📄", "ورقة عمل", "فتح ورقة العمل"], video: ["🎬", "فيديو", "شاهد الفيديو"] };
const PLATFORMS = { wa: ["💬", "واتساب"], tg: ["✈️", "تيليجرام"], teams: ["💻", "Microsoft Teams"], fb: ["👥", "فيسبوك"], other: ["🔗", "أخرى"] };

const COLS = {
  news: {
    ar: "آخر الأخبار", en: "Latest news", one: "خبر",
    fields: [
      { k: "text", l: "نص الخبر", t: "area", req: 1, max: 600 },
      { k: "en", l: "النص بالإنجليزية (اختياري، يظهر عند اختيار English)", t: "area", max: 600 },
      { k: "link", l: "رابط (اختياري)", t: "url", max: 500 }
    ]
  },
  homework: {
    ar: "الواجبات", en: "Homework", one: "واجب",
    empty: "لا توجد واجبات حالياً.",
    fields: [
      { k: "subject", l: "المادة", t: "text", req: 1, max: 60, list: 1 },
      { k: "text", l: "نص الواجب", t: "area", req: 1, max: 600 },
      { k: "imgs", l: "صور مرفقة (اختياري، حتى 5 صور)", t: "images" },
      { k: "due", l: "موعد التسليم", t: "date" },
      { k: "group", l: "الصف / الشعبة (اختياري)", t: "text", max: 200, grp: 1 },
      { k: "link", l: "رابط مرفق (اختياري)", t: "url", max: 500 },
      { k: "linkLabel", l: "اسم زر الرابط (اختياري، الافتراضي: فتح المرفق)", t: "text", max: 40 }
    ]
  },
  exams: {
    ar: "الامتحانات", en: "Exams", one: "امتحان",
    empty: "لا توجد امتحانات مجدولة.",
    fields: [
      { k: "subject", l: "المادة", t: "text", req: 1, max: 60, list: 1 },
      { k: "title", l: "اسم الامتحان (مثال: امتحان الوحدة الثانية)", t: "text", max: 120 },
      { k: "date", l: "تاريخ الامتحان (اختياري)", t: "date" },
      { k: "time", l: "الوقت (اختياري)", t: "text", max: 40 },
      { k: "group", l: "الصف / الشعبة (اختياري)", t: "text", max: 200, grp: 1 },
      { k: "link", l: "رابط تقديم الاختبار (اختياري)", t: "url", max: 500 },
      { k: "linkLabel", l: "اسم زر الرابط (اختياري، الافتراضي: رابط تقديم الاختبار)", t: "text", max: 40 },
      { k: "note", l: "ملاحظات (اختياري)", t: "area", max: 400 }
    ]
  },
  live: {
    ar: "الحصص والتسجيلات", en: "Live classes & recordings", one: "حصة / تسجيل",
    empty: "لا توجد حصص أو تسجيلات حالياً.",
    fields: [
      { k: "kind", l: "النوع", t: "select", req: 1, opts: [["live", "حصة مباشرة"], ["rec", "تسجيل"]] },
      { k: "subject", l: "المادة", t: "text", req: 1, max: 60, list: 1 },
      { k: "title", l: "عنوان الدرس (اختياري)", t: "text", max: 120 },
      { k: "teacher", l: "المدرس (اختياري)", t: "text", max: 60 },
      { k: "when", l: "الموعد (مثال: الأحد 5:00 م)", t: "text", max: 60 },
      { k: "link", l: "رابط الحصة أو التسجيل", t: "url", req: 1, max: 500 },
      { k: "group", l: "الصف / الشعبة (اختياري)", t: "text", max: 200, grp: 1 }
    ]
  },
  teachers: {
    ar: "المدرسون", en: "Teachers", one: "مدرس",
    empty: "لم تُضف أرقام المدرسين بعد.",
    fields: [
      { k: "name", l: "اسم المدرس", t: "text", req: 1, max: 80 },
      { k: "subject", l: "المادة", t: "text", req: 1, max: 60, list: 1 },
      { k: "phone", l: "رقم الجوال", t: "tel", max: 25 },
      { k: "group", l: "الصف / الشعبة (اختياري)", t: "text", max: 200, grp: 1 }
    ]
  },
  progress: {
    ar: "التقدم بالمنهج", en: "Curriculum progress", one: "تقدّم مادة",
    empty: "لم يُسجَّل التقدم بالمنهج بعد.",
    fields: [
      { k: "subject", l: "المادة", t: "text", req: 1, max: 60, list: 1 },
      { k: "unit", l: "الوحدة / الدرس الحالي", t: "text", req: 1, max: 120 },
      { k: "pct", l: "نسبة إنجاز المنهج % (من 0 إلى 100)", t: "number", req: 1, max: 3, lo: 0, hi: 100 },
      { k: "next", l: "الدرس القادم (اختياري)", t: "text", max: 120 },
      { k: "group", l: "الصف / الشعبة (اختياري)", t: "text", max: 200, grp: 1 },
      { k: "note", l: "ملاحظات (اختياري)", t: "area", max: 400 }
    ]
  },
  summaries: {
    ar: "التلخيصات والملفات", en: "Summaries & files", one: "تلخيص / ملف",
    empty: "لا توجد تلخيصات أو ملفات حالياً.",
    fields: [
      { k: "kind", l: "النوع", t: "select", req: 1, opts: Object.entries(SUM_KINDS).map(([v, x]) => [v, x[1]]) },
      { k: "subject", l: "المادة", t: "text", req: 1, max: 60, list: 1 },
      { k: "title", l: "العنوان", t: "text", req: 1, max: 120 },
      { k: "text", l: "وصف مختصر (اختياري)", t: "area", max: 600 },
      { k: "link", l: "رابط التلخيص أو الملف (اختياري)", t: "url", max: 500 },
      { k: "linkLabel", l: "اسم زر الرابط (اختياري، الافتراضي حسب النوع)", t: "text", max: 40 },
      { k: "files", l: "رفع ملفات (اختياري، حتى 3 ملفات، كل ملف حتى 10 ميغابايت)", t: "files" },
      { k: "group", l: "الصف / الشعبة (اختياري)", t: "text", max: 200, grp: 1 }
    ]
  },
  groups: {
    ar: "روابط المجموعات", en: "Group links", one: "مجموعة",
    empty: "لم تُضف روابط المجموعات بعد.",
    fields: [
      { k: "platform", l: "المنصة", t: "select", req: 1, opts: Object.entries(PLATFORMS).map(([v, x]) => [v, x[1]]) },
      { k: "name", l: "اسم المجموعة", t: "text", req: 1, max: 100 },
      { k: "subject", l: "المادة (اختياري)", t: "text", max: 60, list: 1 },
      { k: "link", l: "رابط المجموعة / الانضمام", t: "url", req: 1, max: 500 },
      { k: "group", l: "الصف / الشعبة (اختياري)", t: "text", max: 200, grp: 1 },
      { k: "note", l: "ملاحظات (اختياري)", t: "area", max: 300 }
    ]
  }
};
const CARDS = ["homework", "exams", "live", "teachers", "progress", "summaries", "groups"];

const state = {
  q: "",
  data: { news: {}, homework: {}, exams: {}, live: {}, teachers: {}, progress: {}, summaries: {}, groups: {}, schedule: {}, settings: {} },
  admin: false,
  expanded: {},
  filter: { subj: {}, grp: {} }
};
const listeners = [];
let fbApp = null, fbDb = null, db = null, authWatching = false;
let adminCtx = null, adminUid = null;
let dbReady = null;

function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === null || v === undefined || v === false) continue;
    if (k === "class") el.className = v;
    else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (const kid of kids.flat()) {
    if (kid === null || kid === undefined || kid === false) continue;
    el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  }
  return el;
}
const clean = (v, max = 600) => {
  const t = String(v ?? "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim();
  if (t.length <= max) return t;
  let cut = t.slice(0, max);
  if (/[\uD800-\uDBFF]$/.test(cut)) cut = cut.slice(0, -1); // لا نقطع الإيموجي من المنتصف (سبب علامة �)
  return cut;
};
const safeUrl = (u) => {
  try {
    const x = new URL(String(u).trim());
    return x.protocol === "https:" || x.protocol === "http:" ? x.href : "";
  } catch { return ""; }
};
const phoneTel = (p) => String(p || "").replace(/[^\d+]/g, "");
const waNumber = (p) => {
  let d = String(p || "").replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  else if (d.startsWith("0")) d = "970" + d.slice(1);
  return d;
};
const lang = () => (document.documentElement.lang === "en" ? "en" : "ar");

const todayMid = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const parseDay = (s) => (/^\d{4}-\d{2}-\d{2}$/.test(s || "") ? new Date(s + "T00:00:00") : null);
const dayDiff = (s) => { const d = parseDay(s); return d ? Math.round((d - todayMid()) / 864e5) : null; };
const fmtDay = (s) => {
  const d = parseDay(s);
  return d ? d.toLocaleDateString("ar-u-nu-latn", { weekday: "long", day: "numeric", month: "long" }) : "";
};
const rel = (n) => {
  if (n === 0) return "اليوم";
  if (n === 1) return "غداً";
  if (n === 2) return "بعد يومين";
  if (n > 2 && n <= 10) return `بعد ${n} أيام`;
  if (n > 10) return `بعد ${n} يوماً`;
  if (n === -1) return "أمس";
  return `قبل ${-n} ${-n <= 10 ? "أيام" : "يوماً"}`;
};

const items = (col) => Object.entries(state.data[col] || {})
  .filter(([, v]) => v && typeof v === "object")
  .map(([id, v]) => ({ id, ...v }));
const dateKey = (s) => { const d = dayDiff(s); return d === null ? 5e5 : d >= 0 ? d : 1e6 - d; };
function sorted(col) {
  const a = items(col);
  const byTs = (x, y) => (y.ts || 0) - (x.ts || 0);
  if (col === "homework") return a.sort((x, y) => dateKey(x.due) - dateKey(y.due) || byTs(x, y));
  if (col === "exams") return a.sort((x, y) => dateKey(x.date) - dateKey(y.date) || byTs(x, y));
  if (col === "live") return a.sort((x, y) => (x.kind === "live" ? 0 : 1) - (y.kind === "live" ? 0 : 1) || byTs(x, y));
  if (col === "teachers") return a.sort((x, y) => (x.subject || "").localeCompare(y.subject || "", "ar") || (x.name || "").localeCompare(y.name || "", "ar"));
  if (col === "progress") return a.sort((x, y) => (x.subject || "").localeCompare(y.subject || "", "ar") || (x.group || "").localeCompare(y.group || "", "ar"));
  if (col === "groups") return a.sort((x, y) => (x.subject || "").localeCompare(y.subject || "", "ar") || (x.name || "").localeCompare(y.name || "", "ar"));
  return a.sort(byTs);
}

const SUBJECT_DEFS = [
  ["اللغة العربية", ["عربي", "عربية", "arabic", "نحو"]],
  ["الرياضيات", ["رياضيات", "math", "maths", "mathematics", "ماث", "جبر", "هندسة", "تفاضل", "حساب"]],
  ["اللغة الإنجليزية", ["انجليزي", "انجليزية", "انكليزي", "انكليزية", "english", "انجلش"]],
  ["العلوم", ["علوم", "science"]],
  ["الفيزياء", ["فيزياء", "فيزيا", "physics"]],
  ["الكيمياء", ["كيمياء", "كيميا", "chemistry"]],
  ["الأحياء", ["احياء", "بيولوجيا", "بيولوجي", "biology"]],
  ["التاريخ", ["تاريخ", "history"]],
  ["الجغرافيا", ["جغرافيا", "جغرافيه", "geography"]],
  ["التربية الإسلامية", ["اسلامية", "تربية اسلامية", "اسلامي", "دين", "قران", "تجويد", "islamic"]],
  ["التكنولوجيا", ["تكنولوجيا", "تكنولوجي", "حاسوب", "حاسب", "computer", "برمجة", "tech"]],
  ["اللغة الفرنسية", ["فرنسي", "فرنسية", "french"]],
  ["التربية الوطنية", ["وطنية", "تربية وطنية"]],
  ["الاجتماعيات", ["اجتماعيات", "دراسات اجتماعية"]],
  ["التربية الرياضية", ["رياضة", "رياضية", "تربية رياضية"]],
  ["التربية الفنية", ["فنية", "رسم", "تربية فنية"]],
  ["الاقتصاد", ["اقتصاد"]],
  ["المحاسبة", ["محاسبة"]]
];
const SUBJ_STOP = new Set(["ماده", "مواد", "لغه", "مبحث", "درس", "دروس", "واجب", "واجبات", "منهج", "تدريب"]);
const normAr = (s) => String(s || "").toLowerCase()
  .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
  .replace(/[أإآٱ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي")
  .replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
const subjTokens = (s) => normAr(s).split(" ").filter(Boolean)
  .map((w) => (w.length > 3 && w.startsWith("ال") ? w.slice(2) : w)).filter((w) => !SUBJ_STOP.has(w));
const SUBJ_ALIASES = SUBJECT_DEFS.map(([label, al]) => [label, al.map((a) => subjTokens(a).join(" ")).filter(Boolean)]);
function lev1(a, b) { // هل المسافة بين الكلمتين حرف واحد أو أقل؟
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0, j = 0, diff = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++diff > 1) return false;
    if (a.length > b.length) i++; else if (a.length < b.length) j++; else { i++; j++; }
  }
  return diff + (a.length - i) + (b.length - j) <= 1;
}
function classify(subject) {
  const toks = subjTokens(subject);
  const joined = " " + toks.join(" ") + " ";
  for (const [label, al] of SUBJ_ALIASES) for (const a of al) if (joined.includes(" " + a + " ")) return { key: "k:" + label, label };
  for (const [label, al] of SUBJ_ALIASES) for (const a of al) {
    if (a.length < 5 || a.includes(" ")) continue;
    if (toks.some((t) => t.length >= 5 && lev1(t, a))) return { key: "k:" + label, label };
  }
  const key = toks.join(" ") || normAr(subject);
  return { key: "u:" + key, label: clean(subject, 60) || "أخرى" };
}
function subjectGroups(col) {
  const map = new Map();
  for (const it of items(col)) {
    const c = classify(it.subject);
    const g = map.get(c.key) || { key: c.key, label: c.label, count: 0 };
    g.count++; map.set(c.key, g);
  }
  const order = SUBJECT_DEFS.map((d) => "k:" + d[0]);
  return [...map.values()].sort((a, b) => {
    const ia = order.indexOf(a.key), ib = order.indexOf(b.key);
    return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib) || a.label.localeCompare(b.label, "ar");
  });
}
function subjectSuggestions() {
  const set = new Set(SUBJECT_DEFS.map((d) => d[0]));
  for (const col of CARDS) for (const it of items(col)) if (it.subject) set.add(it.subject);
  return [...set];
}

const LS_LAST_GROUP = "sg-last-group";
const lastGroup = () => { try { return localStorage.getItem(LS_LAST_GROUP) || ""; } catch { return ""; } };
const rememberGroup = (v) => { try { if (v) localStorage.setItem(LS_LAST_GROUP, v); } catch { /* ignore */ } };
const splitGroups = (v) => [...new Set(String(v || "").split(/[؛;\n]/).map((s) => clean(s, 60)).filter(Boolean))];
// كل الصفوف المستخدمة سابقاً (الأكثر استخداماً أولاً)
function groupSuggestions() {
  const cnt = new Map();
  for (const col of CARDS) for (const it of items(col)) if (it.group) cnt.set(it.group, (cnt.get(it.group) || 0) + 1);
  return [...cnt.entries()].sort((x, y) => y[1] - x[1]).map(([g]) => g);
}
function groupsOf(col) {
  const cnt = new Map();
  for (const it of items(col)) if (it.group) cnt.set(it.group, (cnt.get(it.group) || 0) + 1);
  return [...cnt.entries()].sort((x, y) => y[1] - x[1]).map(([name, count]) => ({ name, count }));
}

async function compressImage(file) {
  if (!file || !/^image\//.test(file.type)) throw new Error("not-image");
  if (file.size > 20 * 1024 * 1024) throw new Error("too-big");
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error("decode")); i.src = url; });
    let dim = 1280, q = 0.72, out = "";
    for (let k = 0; k < 8; k++) {
      const sc = Math.min(1, dim / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement("canvas");
      c.width = Math.max(1, Math.round(img.naturalWidth * sc)); c.height = Math.max(1, Math.round(img.naturalHeight * sc));
      const ctx = c.getContext("2d");
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(img, 0, 0, c.width, c.height);
      out = c.toDataURL("image/jpeg", q);
      if (out.length <= 260000) return out;
      if (q > 0.45) q -= 0.1; else dim = Math.round(dim * 0.8);
    }
    if (out.length > 380000) throw new Error("too-big");
    return out;
  } finally { URL.revokeObjectURL(url); }
}
const fmtSize = (n) => (n >= 1048576 ? (n / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(n / 1024)) + " KB");
const readAsDataUrl = (file) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => rej(new Error("read")); r.readAsDataURL(file); });
async function downloadStoredFile(id, name, btn) {
  if (!FILE_ID.test(String(id))) return;
  if (btn) btn.setAttribute("aria-busy", "true");
  try {
    await dbReady;
    if (!db) throw new Error("offline");
    const snap = await fbDb.get(fbDb.ref(db, "files/" + id));
    const v = snap.val();
    if (typeof v !== "string" || !v.startsWith("data:")) throw new Error("bad-file");
    const blob = await (await fetch(v)).blob();
    const url = URL.createObjectURL(blob);
    const a = h("a", { href: url, download: name || "file" });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  } catch { toast("تعذّر تحميل الملف. تحقق من الاتصال وحاول مرة أخرى."); }
  finally { if (btn) btn.removeAttribute("aria-busy"); }
}
const imgCache = new Map();
async function loadImage(id) {
  if (!IMG_ID.test(String(id))) throw new Error("bad-id");
  if (imgCache.has(id)) return imgCache.get(id);
  await dbReady;
  if (!db) throw new Error("offline");
  const snap = await fbDb.get(fbDb.ref(db, "images/" + id));
  const v = snap.val();
  if (typeof v !== "string" || !v.startsWith(IMG_PREFIX)) throw new Error("bad-image");
  imgCache.set(id, v);
  return v;
}

const CSS = `
#sg-ticker,#sg-dash,#sg-sched,.sg-dlg,.sg-bar,.sg-toast{--sg-b:var(--card,#fff);--sg-f:var(--ink,#17261c);--sg-f2:var(--ink-soft,#4d6253);--sg-l:var(--line,#d8e1d7);--sg-a:var(--accent,#104020);--sg-as:var(--accent-soft,#e2eee4);--sg-r:var(--coral,#b03030);--sg-p:var(--paper,#f8f9f4);--sg-at:var(--sg-a);font-family:inherit}
html.dark #sg-ticker,html.dark #sg-dash,html.dark #sg-sched,html.dark .sg-dlg,html.dark .sg-bar,html.dark .sg-toast{--sg-at:color-mix(in srgb,var(--accent,#104020) 36%,#fff)}
#sg-ticker{position:relative}
#sg-ticker[hidden]{display:none}
#sg-ticker .ticker-track:hover,#sg-ticker .ticker-track:focus-within{animation-play-state:paused}
#sg-ticker .ticker-track a{color:inherit;text-decoration:none}
#sg-ticker .ticker-track a:hover,#sg-ticker .ticker-track a:focus-visible{text-decoration:underline}
.sg-tk-edit{position:absolute;inset-block:0;inset-inline-end:0;z-index:2;border:0;background:var(--navy-deep,#101b14);color:#f7faf8;font:inherit;font-weight:800;padding:0 14px;cursor:pointer;box-shadow:0 0 14px 10px var(--navy-deep,#101b14)}
.sg-tk-edit:hover{text-decoration:underline}
@media (prefers-reduced-motion:reduce){#sg-ticker .ticker-track{animation:none}#sg-ticker .ticker-marquee{overflow-x:auto}}
.sg-res .card-open .sg-arr{font-size:15px;line-height:1}
.sg-card-add{display:inline-flex;align-items:center;justify-content:center;text-decoration:none;min-height:34px;padding:0 12px;border-radius:8px 2px;border:1px solid var(--line);background:var(--card);color:var(--tone,var(--accent));font:inherit;font-size:12px;font-weight:800;cursor:pointer;position:relative;z-index:1}
.sg-card-add:hover{background:var(--tone,var(--accent));color:#fff}
@media (max-width:760px){.sg-card-add{background:#fff;color:var(--accent);border-color:#fff;border-radius:5px;min-height:36px}#sg-dash .resource-card-actions{flex-wrap:wrap}}
/* إخفاء قسم «فيديو استخراج الشهادة» من الصفحة الرئيسية على الكمبيوتر فقط */
@media (min-width:761px){.video-guide{display:none!important}}
.footer-update{color:var(--ink-soft);border:1px solid var(--line);cursor:pointer;background:transparent;border-radius:7px 2px;align-items:center;gap:5px;padding:4px 9px;font:inherit;font-size:11px;font-weight:800;display:inline-flex;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}
.footer-update:hover{color:var(--accent);border-color:var(--accent)}
.footer-update[aria-busy="true"]{opacity:.65;pointer-events:none}
.footer-update[aria-busy="true"] svg{animation:sg-spin .8s linear infinite}
@keyframes sg-spin{to{transform:rotate(360deg)}}
.brand b,.footer-brand b{display:inline-flex;align-items:center;direction:ltr;unicode-bidi:isolate}
.sg-verified{display:inline-flex;align-items:center;justify-content:center;flex:none;margin:0 6px 0 0;cursor:pointer;border-radius:50%;line-height:0;transition:transform .16s}
.sg-verified:hover{transform:scale(1.08)}
.sg-verified:focus-visible{outline:3px solid var(--accent,#104020);outline-offset:2px}
.sg-verified svg{width:20px;height:20px;display:block}
.brand .sg-verified svg{width:21px;height:21px}
@media (max-width:760px){.brand .sg-verified{margin-right:4px}.brand .sg-verified svg{width:16px;height:16px}}
.sg-fdd{position:relative;width:100%}
.sg-fdd-btn{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;min-height:44px;padding:8px 14px;cursor:pointer;text-align:start;font:inherit;font-size:14px;font-weight:700;color:var(--ink,#17261c);background:var(--card,#fff);border:1px solid var(--line,#d8e1d7);border-radius:12px 3px}
.sg-fdd-btn:hover,.sg-fdd-btn[aria-expanded="true"]{border-color:var(--accent,#104020)}
.sg-fdd-arrow{transition:transform .16s;opacity:.7}
.sg-fdd-btn[aria-expanded="true"] .sg-fdd-arrow{transform:rotate(180deg)}
.sg-fdd-panel{margin-top:6px;max-height:min(46vh,320px);overflow-y:auto;overscroll-behavior:contain;padding:6px;border:1px solid var(--line,#d8e1d7);border-radius:12px 3px;background:var(--card,#fff);box-shadow:0 14px 34px rgba(10,20,26,.18)}
.sg-fdd-panel[hidden]{display:none}
.sg-fdd-head{padding:9px 10px 4px;font-size:11.5px;font-weight:800;color:var(--ink-soft,#4d6253);opacity:.85}
.sg-fdd-opt{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px 12px;border-radius:8px;cursor:pointer;font-size:15px;color:var(--ink,#17261c)}
.sg-fdd-opt:hover,.sg-fdd-opt:focus-visible{background:var(--accent-soft,#e2eee4);outline:none}
.sg-fdd-name{font-family:inherit;font-size:13.5px;font-weight:700;white-space:nowrap}
.sg-fdd-sample{font-size:19px;line-height:1.3;white-space:nowrap;opacity:.95}
.sg-fdd-opt[aria-selected="true"]{background:var(--accent,#104020);color:#fff;font-weight:800}
.sg-frows{display:grid;gap:6px;margin-top:8px}
.sg-frow{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:7px 10px;border:1px solid var(--sg-l);border-radius:10px;background:var(--sg-p)}
.sg-fname{font-size:13px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
.sg-frow button{border:0;background:transparent;color:var(--sg-r);cursor:pointer;font-size:15px;padding:2px 6px}
.sg-filebtn{display:flex;width:100%;justify-content:center;margin-top:6px}
.sg-filebtn[aria-busy="true"]{opacity:.6;pointer-events:none}
.sg-card-off{opacity:.62;outline:2px dashed var(--sg-r,#b03030);outline-offset:-2px}
.sg-off-badge{position:absolute;z-index:4;inset-block-start:0;inset-inline-start:0;max-width:calc(100% - 100px);overflow:hidden;text-overflow:ellipsis;background:var(--sg-r,#b03030);color:#fff;font-size:11px;line-height:1.2;font-weight:800;padding:3px 10px 3px 16px;padding-inline:16px 10px;border-end-end-radius:10px;white-space:nowrap;pointer-events:none}
@media (max-width:760px){.sg-off-badge{max-width:calc(100% - 24px)}}
/* «الوضع الجديد»: زر الخدمات الإلكترونية يتصرف مثل «أحتاج مساعدة» عند التمرير (نص بلون الثيم، الخلفية زجاجية بدون تعبئة) */
:root[data-glass="on"] a.secondary-cta.electronic-services-cta:hover,:root[data-glass="on"] a.secondary-cta.electronic-services-cta:focus-visible{color:var(--accent)!important}
.share-resource[aria-busy="true"]{opacity:.6;pointer-events:none}
.resource-card-actions.sg-multi{flex-wrap:wrap;justify-content:stretch;row-gap:7px}
.resource-card-actions.sg-multi .card-open{flex:1 1 auto;width:auto}
.resource-card-actions.sg-full .card-open{flex:1 1 100%;width:100%}
.resource-card-actions.sg-multi .share-resource,.resource-card-actions.sg-multi .copy-resource{display:inline-flex;flex:1 1 84px;min-width:0;min-height:36px;padding:0 8px;font-size:11px;line-height:1.25;text-align:center;white-space:normal;text-decoration:none}
.resource-card-actions.sg-multi .share-resource span,.resource-card-actions.sg-multi .copy-resource span{display:inline}
.sg-acts .share-resource{min-height:40px;padding:0 16px;font-size:12px;gap:6px;text-decoration:none}
.sg-sc-foot .share-resource{display:inline-flex;min-height:46px;padding:0 20px;font-size:13px;gap:7px}
.sg-sc-foot .share-resource span{display:inline}
.sg-dlg .share-resource{display:inline-flex;text-decoration:none}
.sg-dlg .share-resource span{display:inline}
.sg-dlg .share-resource svg{flex:none}
#sg-sres{display:contents}
#sg-sres~button:not(.search-suggestion){display:none}
body.sg-search-hit .empty-search{display:none}
#sg-dash{max-width:1280px;margin:0 auto;padding:24px 32px 56px}
#sg-dash[hidden]{display:none}
.sg-list{display:flex;flex-direction:column}
.sg-item{display:flex;gap:8px;padding:12px 0;border-top:1px solid var(--sg-l);align-items:flex-start}
.sg-item:first-child{border-top:0}
.sg-item-b{flex:1;min-width:0;display:flex;flex-direction:column;gap:6px}
.sg-row{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.sg-chip{background:var(--sg-as);color:var(--sg-at);border-radius:8px;padding:2px 9px;font-size:12.5px;font-weight:800}
.sg-chip-soft{background:transparent;border:1px solid var(--sg-l);color:var(--sg-f2);font-weight:600}
.sg-badge{border-radius:8px;padding:2px 9px;font-size:12.5px;font-weight:700;background:var(--sg-p);color:var(--sg-f2);border:1px solid var(--sg-l)}
.sg-soon{background:color-mix(in srgb,var(--sg-r) 14%,transparent);color:var(--sg-r);border-color:transparent}
.sg-late{opacity:.7;text-decoration:line-through}
.sg-live-dot{color:var(--sg-r)}
.sg-title{margin:0;font-weight:800;color:var(--sg-f);font-size:15px;line-height:1.5}
.sg-txt{margin:0;color:var(--sg-f);font-size:14.5px;line-height:1.7;white-space:pre-wrap;overflow-wrap:anywhere}
.sg-meta{margin:0;color:var(--sg-f2);font-size:13px;line-height:1.6}
.sg-ctl{display:flex;gap:4px;flex:none}
.sg-del:hover{background:color-mix(in srgb,var(--sg-r) 14%,transparent);color:var(--sg-r)}
.sg-empty{margin:8px 0;color:var(--sg-f2);font-size:14px}
.sg-ic-btns{display:flex;flex-wrap:wrap;gap:8px}
.sg-bar{position:fixed;inset-block-end:18px;inset-inline:0;margin-inline:auto;width:max-content;max-width:calc(100% - 24px);z-index:60;display:flex;align-items:center;gap:14px;background:var(--navy-deep,#101b14);color:#f4f1e8;border:1px solid rgba(255,255,255,.12);border-radius:99px;padding-block:6px;padding-inline:18px 6px;box-shadow:0 12px 32px #0007;font-size:14px;font-weight:800}
.sg-bar{background:linear-gradient(135deg,rgba(255,255,255,.16),rgba(255,255,255,.04)),rgba(16,27,20,.42);-webkit-backdrop-filter:blur(18px) saturate(160%);backdrop-filter:blur(18px) saturate(160%);border:1px solid rgba(255,255,255,.28);box-shadow:0 12px 34px rgba(10,20,26,.28),inset 0 1px 0 rgba(255,255,255,.35);text-shadow:0 1px 2px rgba(0,0,0,.35)}
.sg-bar-out{border:1px solid rgba(255,255,255,.22)!important;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
.sg-bar-lbl{display:inline-flex;align-items:center;gap:2px;white-space:nowrap}
.sg-bar-out{border:0;cursor:pointer;min-height:36px;padding:0 18px;border-radius:99px;background:rgba(255,255,255,.14);color:inherit;font:inherit;font-size:13px;font-weight:800;transition:background-color .16s}
.sg-bar-out:hover{background:rgba(255,255,255,.26)}
.sg-dot{width:9px;height:9px;border-radius:50%;background:#4cd37b;display:inline-block;margin-inline-end:8px;box-shadow:0 0 0 4px rgba(76,211,123,.2)}
.sg-toast{position:fixed;inset-block-end:76px;inset-inline:0;margin-inline:auto;width:max-content;max-width:calc(100% - 24px);z-index:80;background:rgba(16,27,20,.38);color:#fff;border:1px solid rgba(255,255,255,.3);border-radius:99px;padding:9px 20px;font-size:13.5px;font-weight:600;letter-spacing:.1px;text-shadow:0 1px 2px rgba(0,0,0,.35);-webkit-backdrop-filter:blur(16px) saturate(160%);backdrop-filter:blur(16px) saturate(160%);box-shadow:0 8px 26px rgba(10,20,26,.18),inset 0 1px 0 rgba(255,255,255,.3);animation:sg-toast-in .28s cubic-bezier(.2,.8,.2,1)}
@keyframes sg-toast-in{from{opacity:0;transform:translateY(8px) scale(.97)}to{opacity:1;transform:none}}
.sg-dlg{margin:auto;border:0;padding:0;border-radius:20px;background:var(--sg-b);color:var(--sg-f);width:min(520px,calc(100% - 24px));max-height:calc(100dvh - 24px);box-shadow:0 30px 80px #0007}
.sg-dlg.sg-wide{width:min(720px,calc(100% - 24px))}
.sg-dlg::backdrop{background:rgba(8,14,10,.55);backdrop-filter:blur(2px)}
.sg-dlg-in{padding:20px;display:flex;flex-direction:column;gap:14px;max-height:calc(100dvh - 24px);overflow:auto}
.sg-dlg-h{display:flex;align-items:center;gap:10px}
.sg-dlg-h h3{margin:0;flex:1;font-size:18px;font-weight:800}
.sg-f{display:flex;flex-direction:column;gap:6px}
.sg-f label{font-size:13.5px;font-weight:700;color:var(--sg-f2)}
.sg-f input,.sg-f textarea,.sg-f select{font:inherit;font-size:16px;color:var(--sg-f);background:var(--sg-p);border:1px solid var(--sg-l);border-radius:12px;padding:10px 12px;min-height:44px;width:100%;box-sizing:border-box}
.sg-f textarea{resize:vertical;min-height:84px}
.sg-f input:focus,.sg-f textarea:focus,.sg-f select:focus{outline:2px solid var(--sg-at);outline-offset:1px}
.sg-err{margin:0;color:var(--sg-r);font-size:13.5px;font-weight:700;min-height:1.2em}
.sg-acts{display:flex;gap:8px;justify-content:flex-start;flex-wrap:wrap}
.sg-acts button[disabled]{opacity:.6;cursor:wait}
.sg-mgr{display:flex;flex-direction:column}
.sg-mgr .sg-item{padding:10px 0}
#sg-dash button:focus-visible,#sg-dash a:focus-visible,.sg-dlg button:focus-visible,.sg-dlg a:focus-visible,#sg-ticker button:focus-visible,#sg-ticker a:focus-visible,.sg-bar button:focus-visible{outline:3px solid var(--sg-at);outline-offset:2px}
.sg-acts .primary-cta,.sg-acts .secondary-cta{flex:1 1 auto}
.sg-ctl .close-button{font-size:15px}
.sg-item .primary-cta,.sg-item .secondary-cta{align-self:flex-start}
.sg-subjects{margin:0 0 4px}
.sg-subjects button{flex:0 1 auto;padding:0 14px}
.sg-subjects button[aria-pressed="true"]{color:#fff;background:var(--accent,#104020);border-color:var(--accent,#104020)}
.sg-imgs{display:flex;flex-wrap:wrap;gap:8px}
.sg-thumb{position:relative;width:76px;height:76px;border-radius:10px;overflow:hidden;border:1px solid var(--sg-l);background:var(--sg-p)}
.sg-thumb img{width:100%;height:100%;object-fit:cover;display:block}
.sg-thumb button{position:absolute;inset-block-start:2px;inset-inline-start:2px;width:26px;height:26px;border-radius:99px;border:0;background:rgba(0,0,0,.65);color:#fff;font-size:13px;cursor:pointer}
.sg-gal{display:flex;flex-direction:column;gap:8px}
.sg-gal img{width:100%;height:auto;border-radius:12px;border:1px solid var(--sg-l);display:block}
.sg-f input[type=file]{padding:8px}
#sg-dash .hero-primary,.sg-dlg .hero-primary{background:var(--coral,#b03030);box-shadow:0 11px 22px color-mix(in srgb,var(--coral,#b03030) 26%,transparent)}
#sg-dash .hero-primary:hover,.sg-dlg .hero-primary:hover{box-shadow:0 14px 27px color-mix(in srgb,var(--coral,#b03030) 33%,transparent);background:#bf573f}
@media (max-width:760px){#sg-dash .hero-primary,.sg-dlg .hero-primary{background:var(--mobile-olive,#78936A)!important;box-shadow:0 8px 17px color-mix(in srgb,var(--mobile-olive,#78936A) 32%,transparent)!important}}
@media (max-width:640px){#sg-dash{padding:4px 16px 40px}}
.hero>.hero-art{display:none!important}
#sg-sched{min-width:0;background:var(--sg-b);color:var(--sg-f);border:1px solid var(--sg-l);border-radius:40px 6px;box-shadow:var(--shadow);padding:24px 20px 20px;display:flex;flex-direction:column;gap:12px;box-sizing:border-box}
#sg-sched .sg-sc-title{margin:0;font:900 clamp(18px,2vw,23px)/1.45 Cairo,Tajawal,sans-serif;color:var(--sg-f);letter-spacing:0}
#sg-sched p{margin:0;max-width:none;font-size:13.5px;line-height:1.7;color:var(--sg-f2)}
#sg-sched .sg-sc-sub{font-weight:700}
#sg-sched .sg-sc-wrap{overflow-x:auto;border:1px solid var(--sg-l);border-radius:14px}
#sg-sched table{width:100%;border-collapse:collapse;min-width:400px;font-size:13.5px}
#sg-sched th,#sg-sched td{padding:9px 6px;text-align:center;border-bottom:1px solid var(--sg-l);vertical-align:middle;line-height:1.45}
#sg-sched tbody tr:last-child th,#sg-sched tbody tr:last-child td{border-bottom:0}
#sg-sched thead th{background:var(--sg-as);color:var(--sg-at);font-weight:800;font-size:12.5px}
#sg-sched tbody th{font-weight:800;white-space:nowrap;color:var(--sg-f)}
#sg-sched .sg-sc-n{display:inline-grid;place-items:center;width:20px;height:20px;border-radius:50%;background:var(--sg-at);color:var(--sg-b);font-size:11px;margin-inline-end:5px}
#sg-sched .sg-sc-s{font-weight:800;color:var(--sg-f)}
#sg-sched .sg-sc-t,#sg-sched .sg-sc-time{font-size:12px;color:var(--sg-f2)}
#sg-sched .sg-sc-no{color:var(--sg-f2);opacity:.6}
#sg-sched tr.sg-today th,#sg-sched tr.sg-today td{background:var(--sg-a);color:#fff;border-bottom-color:rgba(255,255,255,.18)}
#sg-sched tr.sg-today .sg-sc-s,#sg-sched tr.sg-today .sg-sc-no{color:#fff}
#sg-sched tr.sg-today .sg-sc-t,#sg-sched tr.sg-today .sg-sc-time{color:rgba(255,255,255,.82)}
html.dark #sg-sched tr.sg-today th,html.dark #sg-sched tr.sg-today td{background:var(--sg-a)}
#sg-sched .sg-sc-today{display:inline-block;margin-inline-start:6px;padding:1px 8px;border-radius:99px;background:rgba(255,255,255,.22);font-size:11px;font-weight:800}
#sg-sched .sg-sc-foot{display:flex;flex-wrap:wrap;gap:10px;align-items:center}
#sg-sched .sg-sc-foot .primary-cta,#sg-sched .sg-sc-foot .secondary-cta{flex:0 1 auto}
#sg-sched .sg-sc-off{display:inline-flex;align-items:center;min-height:44px;padding:0 18px;border-radius:99px;border:1px dashed var(--sg-l);color:var(--sg-f2);font-size:13.5px;font-weight:700}
.sg-ed-day{border:1px solid var(--sg-l);border-radius:14px;padding:12px;display:flex;flex-direction:column;gap:10px}
.sg-ed-dh{display:flex;gap:8px;align-items:center}
.sg-ed-dh select{flex:1;font:inherit;font-size:16px;font-weight:800;min-height:44px;border-radius:12px;border:1px solid var(--sg-l);background:var(--sg-p);color:var(--sg-f);padding:0 10px}
.sg-ed-per{display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:6px;align-items:end}
.sg-ed-per .sg-f label{font-size:12px}
.sg-ed-per .sg-f input{padding:8px 10px}
@media (max-width:640px){.sg-ed-per{grid-template-columns:1fr 1fr}.sg-ed-per .close-button{grid-column:2;justify-self:end}#sg-sched{padding:20px 14px 16px;border-radius:28px 6px}}
@media (max-width:640px){
#sg-sched .sg-sc-title{font-size:19px}
#sg-sched .sg-sc-wrap{overflow:visible;border:0;border-radius:0}
#sg-sched table,#sg-sched tbody,#sg-sched tr,#sg-sched th,#sg-sched td{display:block;min-width:0;width:auto}
#sg-sched table{border:0}
#sg-sched thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
#sg-sched tbody tr{border:1px solid var(--sg-l);border-radius:16px;overflow:hidden;margin-bottom:10px;background:var(--sg-b)}
#sg-sched tbody tr:last-child{margin-bottom:0}
#sg-sched tbody th{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 14px;text-align:start;font-size:15px;background:var(--sg-as);color:var(--sg-at);border-bottom:1px solid var(--sg-l)}
#sg-sched tbody td{display:grid;grid-template-columns:30px minmax(0,1fr) auto;grid-template-rows:auto auto;column-gap:12px;align-items:center;padding:10px 14px;text-align:start;border-bottom:1px solid var(--sg-l)}
#sg-sched tbody td:last-child{border-bottom:0}
#sg-sched tbody td:has(.sg-sc-no){display:none}
#sg-sched tbody td::before{content:attr(data-n);grid-column:1;grid-row:1 / span 2;display:grid;place-items:center;width:28px;height:28px;border-radius:50%;background:var(--sg-as);color:var(--sg-at);font-weight:900;font-size:13px}
#sg-sched .sg-sc-s,#sg-sched .sg-sc-t{direction:inherit;unicode-bidi:isolate}
#sg-sched .sg-sc-s{grid-column:2;grid-row:1;font-size:15px}
#sg-sched .sg-sc-t{grid-column:2;grid-row:2;font-size:12.5px}
#sg-sched .sg-sc-time{grid-column:3;grid-row:1 / span 2;white-space:nowrap;font-size:12px;padding:4px 9px;border-radius:99px;background:var(--sg-as);color:var(--sg-at);font-weight:700}
#sg-sched .sg-sc-s:only-child{grid-row:1 / span 2}
#sg-sched tr.sg-today{border:2px solid var(--sg-a)}
#sg-sched tr.sg-today th{background:var(--sg-a);color:#fff;border-bottom:0}
html.dark #sg-sched tr.sg-today th{background:var(--sg-a)}
#sg-sched tr.sg-today td{background:transparent;color:var(--sg-f);border-bottom-color:var(--sg-l)}
#sg-sched tr.sg-today td::before{background:var(--sg-a);color:#fff}
#sg-sched tr.sg-today .sg-sc-s{color:var(--sg-f)}
#sg-sched tr.sg-today .sg-sc-t{color:var(--sg-f2)}
#sg-sched tr.sg-today .sg-sc-time{background:var(--sg-as);color:var(--sg-at)}
#sg-sched .sg-sc-today{margin:0;background:rgba(255,255,255,.25)}
#sg-sched .sg-sc-foot .primary-cta,#sg-sched .sg-sc-foot .secondary-cta,#sg-sched .sg-sc-foot .sg-sc-off{flex:1 1 100%;justify-content:center;text-align:center;margin-top:0}
}

.sg-upd{display:block;color:inherit;font-size:.9em;font-weight:700;opacity:.85;line-height:1.5}
.sg-upd time{font-weight:800}
.sg-upd-in{margin-top:5px}
.sg-upd-top{margin:0 0 12px;color:var(--sg-f2);opacity:1;font-size:13px}
.sg-upd-sc{margin:-4px 0 0;color:var(--sg-f2);opacity:1;font-size:12.5px}
.sg-upd-dlg{margin:-6px 0 0;color:var(--sg-f2);opacity:1;font-size:13px}
.sg-pg{height:10px;border-radius:99px;background:var(--sg-as);border:1px solid var(--sg-l);overflow:hidden}
.sg-pg>span{display:block;height:100%;background:var(--sg-a);border-radius:99px;transition:width .3s}
html.dark .sg-pg>span{background:var(--sg-at)}
.sg-donebar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;padding:10px 14px;border:1px solid var(--sg-l);border-radius:12px;background:var(--sg-p)}
.sg-count{font-weight:800;font-size:14px;color:var(--sg-f)}
.sg-hide{display:inline-flex;align-items:center;gap:8px;min-height:36px;font-size:13.5px;font-weight:700;color:var(--sg-f2);cursor:pointer}
.sg-hide input{width:20px;height:20px;accent-color:var(--sg-a);cursor:pointer}
.sg-item.sg-done .sg-txt{text-decoration:line-through;opacity:.6}
.sg-item.sg-done .sg-chip{opacity:.65}
.sg-done-btn.is-done{background:var(--sg-as);color:var(--sg-at);border-color:var(--sg-a)}
.sg-fsel{display:block;width:100%;min-height:44px;margin-top:13px;padding:0 12px;font:inherit;font-size:14px;font-weight:700;color:var(--ink,#17261c);background:var(--card,#fff);border:1px solid var(--line,#d8e1d7);border-radius:9px 2px;cursor:pointer;box-sizing:border-box}
.sg-fsel:focus-visible{outline:3px solid var(--accent,#104020);outline-offset:2px}
#sg-font-status{min-height:1.2em}
`;

const iconBtn = (label, glyph, fn, cls = "") => h("button", { type: "button", class: `close-button ${cls}`.trim(), "aria-label": label, title: label, onclick: fn }, glyph);
const chip = (t, cls = "") => (t ? h("span", { class: `sg-chip ${cls}`.trim() }, t) : null);
const linkBtn = (href, text, pri) => {
  const u = safeUrl(href);
  return u ? h("a", { class: pri ? "primary-cta hero-primary" : "secondary-cta", href: u, target: "_blank", rel: "noopener noreferrer" }, text) : null;
};
const SITE_URL = "https://anaspal.github.io/StudyGuidePalestine/";
// بعض تطبيقات المشاركة (واتساب سطح المكتب/ويندوز) تحوّل الإيموجي إلى � — لذلك نستبدلها بنص عادي قبل المشاركة
const EMOJI_WORDS = [[/\u{1F4C5}\uFE0F?/gu, "التاريخ:"], [/\u{1F4DE}\uFE0F?/gu, "هاتف:"], [/\u{1F552}\uFE0F?/gu, "الوقت:"], [/\u{1F4F7}\uFE0F?/gu, ""], [/\u{1F517}\uFE0F?/gu, ""]];
function shareSafe(t) {
  let x = String(t || "");
  for (const [re, w] of EMOJI_WORDS) x = x.replace(re, w);
  x = x.replace(/([?&])utm_[a-z]+=[^&\s]*/gi, (m, c) => (c === "?" ? "?" : "")).replace(/\?(?=\s|$)/g, "").replace(/&(?=\s|$)/g, "");
  x = x.replace(/[\u{10000}-\u{10FFFF}]/gu, "").replace(/[\uD800-\uDFFF]/g, "").replace(/\uFFFD/g, "");
  return x.replace(/[ \t]+\n/g, "\n").replace(/ {2,}/g, " ");
}
const shareText = (section, lines) => shareSafe([clean(section, 200), ...lines.map((l) => clean(l, 1500)).filter(Boolean)].join("\n")
  + "\n\n" + (lang() === "en" ? "Source: " : "المصدر: ") + SITE_URL);
const shareHref = (section, lines) => "https://wa.me/?text=" + encodeURIComponent(shareText(section, lines));
const shareLabel = () => (lang() === "en" ? "Share" : "مشاركة");
const shareBtn = (section, lines, cls = "share-resource sg-share", label = shareLabel()) => h("a", {
  class: cls, href: shareHref(section, lines), target: "_blank", rel: "noopener noreferrer",
  "aria-label": lang() === "en" ? "Share via WhatsApp" : "مشاركة عبر واتساب",
  title: lang() === "en" ? "Share via WhatsApp" : "مشاركة عبر واتساب"
}, svgIcon("share", 16), h("span", {}, label));
const dataUrlToFile = (u, name) => {
  const m = /^data:([^;,]+)?(;base64)?,(.*)$/s.exec(u || "");
  if (!m) throw new Error("bad-data-url");
  const bin = atob(m[3]);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new File([arr], name, { type: m[1] || "image/jpeg" });
};
const homeworkShareLines = (it, withImgNote) => [
  [it.subject, it.group].filter(Boolean).join(" - "),
  it.text,
  it.due ? "📅 " + fmtDay(it.due) : "",
  safeUrl(it.link) ? (it.linkLabel || "المرفق") + ": " + safeUrl(it.link) : "",
  withImgNote && Array.isArray(it.imgs) && it.imgs.length ? `📷 (${it.imgs.length}) صور مرفقة في الواجب` : ""
];
// ---- تجهيز الصور مسبقاً كملفات: حتى تكون المشاركة فورية ولا ينتهي "السماح بالمشاركة" أثناء الانتظار ----
const fileCache = new Map();
const filePending = new Map();
function prepFile(id) {
  if (fileCache.has(id)) return Promise.resolve(fileCache.get(id));
  if (filePending.has(id)) return filePending.get(id);
  const p = Promise.race([
    loadImage(id).then((u) => { const f = dataUrlToFile(u, "homework-" + id.slice(-6) + ".jpg"); fileCache.set(id, f); return f; }),
    new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 25000))
  ]).finally(() => filePending.delete(id));
  filePending.set(id, p);
  return p;
}
async function prefetchIds(ids) {
  const todo = ids.filter((id) => IMG_ID.test(String(id)) && !fileCache.has(id));
  for (let i = 0; i < todo.length; i += 3) await Promise.allSettled(todo.slice(i, i + 3).map(prepFile));
}
const idsReady = (ids) => ids.every((id) => fileCache.has(id));
function watchVisible(el, ids) {
  const go = () => { try { prefetchIds(ids); } catch { /* ignore */ } };
  ["pointerenter", "pointerdown", "touchstart", "focus"].forEach((ev) => el.addEventListener(ev, go, { once: true, passive: true }));
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); setTimeout(go, 300); } });
    io.observe(el);
  } else setTimeout(go, 1500);
}
async function shareWithFiles(ids, text, fallbackHref, btn) {
  const openText = (note) => {
    const w = window.open(fallbackHref, "_blank", "noopener");
    if (!w) location.href = fallbackHref;
    if (note) toast(note);
  };
  if (!ids.length) { openText(); return; }
  if (btn) btn.setAttribute("aria-busy", "true");
  try {
    const waited = !idsReady(ids);
    if (waited) toast("جاري تجهيز الصور… لحظات");
    const files = [];
    for (const id of ids) { try { files.push(await prepFile(id)); } catch { /* صورة تعذّر تحميلها */ } }
    if (!files.length) { openText("تعذّر تحميل الصور. تم فتح واتساب بالنص فقط."); return; }
    const data = { files, text };
    if (!(navigator.canShare && navigator.canShare(data))) {
      openText("متصفحك لا يدعم إرسال الصور مباشرة. حمّل الصور من «عرض الصور» وأرفقها يدوياً."); return;
    }
    try { await navigator.share(data); }
    catch (ex) {
      if (ex && ex.name === "AbortError") return;
      if (ex && ex.name === "NotAllowedError" && waited) { toast("الصور جاهزة ✓ اضغط «مشاركة» مرة ثانية"); return; }
      throw ex;
    }
  } catch (ex) {
    if (ex && ex.name === "AbortError") return;
    openText("تعذّر إرفاق الصور تلقائياً. تم فتح واتساب بالنص، حمّل الصور من «عرض الصور».");
  } finally {
    if (btn) btn.removeAttribute("aria-busy");
  }
}
function shareHomework(it, btn) {
  const section = secName("homework");
  const ids = Array.isArray(it.imgs) ? it.imgs.filter((x) => IMG_ID.test(String(x))) : [];
  return shareWithFiles(ids, shareText(section, homeworkShareLines(it, false)), shareHref(section, homeworkShareLines(it, true)), btn);
}
// مشاركة بطاقة الواجبات كاملة (نص مرتب حسب المادة + صور أهم الواجبات)
const CARD_IMG_MAX = 10;
function homeworkCardPlan() {
  const list = sorted("homework");
  const bySubj = new Map();
  for (const it of list) { const k = it.subject || "أخرى"; if (!bySubj.has(k)) bySubj.set(k, []); bySubj.get(k).push(it); }
  const ids = [];
  const lines = [];
  for (const [subj, arr] of bySubj) {
    const grp = [...new Set(arr.map((x) => x.group).filter(Boolean))].join("، ");
    lines.push("• " + subj + (grp ? " - " + grp : "") + ":");
    arr.forEach((it, i) => {
      const imgs = (Array.isArray(it.imgs) ? it.imgs : []).filter((x) => IMG_ID.test(String(x)));
      const take = imgs.filter((x) => ids.length < CARD_IMG_MAX && !ids.includes(x) && ids.push(x));
      lines.push((i + 1) + ". " + clean(it.text, 600) + (dayDiff(it.due) !== null ? " (التسليم: " + fmtDay(it.due) + ")" : "") + (take.length ? " (" + take.length + ") صور مرفقة" : (imgs.length ? " — الصور في الموقع" : "")));
    });
  }
  return { ids, lines, any: list.some((x) => Array.isArray(x.imgs) && x.imgs.length) };
}
function homeworkCardShareBtn() {
  const plan = homeworkCardPlan();
  const section = secName("homework");
  const btn = h("button", {
    type: "button", class: "share-resource sg-share", "aria-label": "مشاركة الواجبات عبر واتساب", title: "مشاركة الواجبات عبر واتساب",
    onclick: (e) => { const pl = homeworkCardPlan(); shareWithFiles(pl.ids, shareText(section, pl.lines), shareHref(section, pl.lines), e.currentTarget); }
  }, svgIcon("share", 16), h("span", {}, plan.ids.length ? "مشاركة مع الصور" : "مشاركة"));
  if (plan.ids.length) watchVisible(btn, plan.ids);
  return btn;
}
const secName = (col) => COLS[col][lang()];
// نص مشاركة بطاقة قسم كامل (الواجبات / الامتحانات / المدرسون): قائمة مختصرة بكل عناصره
function cardShareLines(col) {
  const clip = (t, n) => { const x = clean(t, 2000).replace(/\s+/g, " "); return x.length > n ? x.slice(0, n).trim() + "…" : x; };
  const list = sorted(col);
  if (!list.length) return [COLS[col].empty];
  const fmt = {
    homework: (it) => "• " + [[it.subject, it.group].filter(Boolean).join(" - "), clip(it.text, 90)].filter(Boolean).join(": ") + (dayDiff(it.due) !== null ? " — 📅 " + fmtDay(it.due) : ""),
    exams: (it) => "• " + [[it.subject, it.title].filter(Boolean).join(" - "), it.group].filter(Boolean).join(" ") + (dayDiff(it.date) !== null ? " — 📅 " + fmtDay(it.date) : "") + (it.time ? " 🕒 " + it.time : ""),
    teachers: (it) => "• " + [it.name, it.subject, it.phone ? "📞 " + it.phone : ""].filter(Boolean).join(" — "),
    progress: (it) => "• " + [[it.subject, it.group].filter(Boolean).join(" - "), [it.unit, pctOf(it.pct) + "%"].filter(Boolean).join(" — ")].filter(Boolean).join(": "),
    summaries: (it) => "• " + [[it.subject, it.title].filter(Boolean).join(": "), safeUrl(it.link)].filter(Boolean).join(" — "),
    groups: (it) => "• " + [it.name, it.subject, safeUrl(it.link)].filter(Boolean).join(" — ")
  }[col];
  const lines = [];
  let len = 0;
  for (const it of list) {
    const ln = fmt(it);
    if (len + ln.length > 900) break;
    lines.push(ln); len += ln.length + 1;
  }
  if (lines.length < list.length) lines.push(`… و${list.length - lines.length} أخرى — كل التفاصيل في الموقع`);
  return lines;
}

function dueBadge(s, prefix) {
  const d = dayDiff(s);
  if (d === null) return null;
  const cls = d < 0 ? "sg-badge sg-late" : d <= 1 ? "sg-badge sg-soon" : "sg-badge";
  return h("span", { class: cls }, `${prefix ? prefix + " " : ""}${rel(d)}`);
}

let toastTimer = 0;
function toast(msg) {
  document.querySelectorAll(".sg-toast").forEach((t) => t.remove());
  const t = h("div", { class: "sg-toast", role: "status", "aria-live": "polite" }, msg);
  document.body.append(t);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.remove(), 3200);
}

// ---- آخر تحديث: أحدث upd (أو ts للعناصر القديمة) في القسم ----
const itemTs = (it) => Number(it && (it.upd || it.ts)) || 0;
const colLast = (col) => items(col).reduce((m, it) => Math.max(m, itemTs(it)), 0);
function fmtUpd(ts) {
  const en = lang() === "en";
  const d = new Date(ts);
  const days = Math.round((todayMid() - new Date(ts).setHours(0, 0, 0, 0)) / 864e5);
  const loc = en ? "en-GB" : "ar-u-nu-latn";
  const time = d.toLocaleTimeString(loc, { hour: "numeric", minute: "2-digit", hour12: true });
  if (days === 0) return (en ? "Today " : "اليوم ") + time;
  if (days === 1) return (en ? "Yesterday " : "أمس ") + time;
  return d.toLocaleDateString(loc, { day: "numeric", month: "long", year: "numeric" }) + " · " + time;
}
function updEl(ts, cls) {
  if (!ts || !Number.isFinite(ts)) return null;
  return h("small", { class: ("sg-upd " + (cls || "")).trim() },
    h("span", { "aria-hidden": "true" }, "🕒 "), lang() === "en" ? "Last updated: " : "آخر تحديث: ",
    h("time", { datetime: new Date(ts).toISOString() }, fmtUpd(ts)));
}
const pctOf = (v) => Math.min(100, Math.max(0, Math.round(Number(v) || 0)));

// ---- «علّمه منجزاً» للواجبات: يُحفظ على هذا الجهاز فقط (localStorage) ----
const LS_DONE = "sg-hw-done", LS_HIDE_DONE = "sg-hw-hide-done";
const readDone = () => {
  try { const v = JSON.parse(localStorage.getItem(LS_DONE) || "{}"); return v && typeof v === "object" && !Array.isArray(v) ? v : {}; } catch { return {}; }
};
let doneMap = readDone();
let hideFlag = (() => { try { return localStorage.getItem(LS_HIDE_DONE) === "1"; } catch { return false; } })();
const saveDone = () => { try { localStorage.setItem(LS_DONE, JSON.stringify(doneMap)); } catch { /* ignore */ } };
const isDone = (id) => !!doneMap[id];
const hideDone = () => hideFlag;
function refreshLocal() {
  renderDash(); syncSearch();
  listeners.slice().forEach((f) => { try { f(); } catch { /* ignore */ } });
}
function setDone(id, on) { if (on) doneMap[id] = Date.now(); else delete doneMap[id]; saveDone(); refreshLocal(); }
function setHideDone(on) {
  hideFlag = !!on;
  try { if (on) localStorage.setItem(LS_HIDE_DONE, "1"); else localStorage.removeItem(LS_HIDE_DONE); } catch { /* ignore */ }
  refreshLocal();
}
// حذف سجلات الواجبات المحذوفة من الخادم (يُستدعى فقط بعد وصول بيانات حقيقية من Firebase)
function pruneDone() {
  const live = state.data.homework || {};
  let changed = false;
  for (const id of Object.keys(doneMap)) if (!(id in live)) { delete doneMap[id]; changed = true; }
  if (changed) saveDone();
}
const doneBtn = (it) => {
  const done = isDone(it.id);
  return h("button", { type: "button", class: "secondary-cta sg-done-btn" + (done ? " is-done" : ""), "data-done-btn": it.id, onclick: () => setDone(it.id, !done) },
    done ? "↩ إلغاء الإنجاز" : "✓ علّمه منجزاً");
};

// ---- اختيار الخط: 16 خطاً عربياً (Cairo وTajawal محليان، والباقي من Google Fonts عند اختياره فقط) ----
const LS_FONT = "sg-font";
const FONTS = [
  { id: "Cairo", local: true }, { id: "Tajawal", local: true }, { id: "Amiri", local: true, file: true },
  { id: "Almarai" }, { id: "IBM Plex Sans Arabic" }, { id: "Noto Kufi Arabic" }, { id: "Noto Naskh Arabic" },
  { id: "Noto Sans Arabic" }, { id: "El Messiri" }, { id: "Changa" },
  { id: "Readex Pro" }, { id: "Reem Kufi" }, { id: "Alexandria" }, { id: "Vazirmatn" },
  { id: "Rubik" }, { id: "Mada" }
];
const savedFont = () => {
  try { const v = localStorage.getItem(LS_FONT) || ""; return FONTS.some((f) => f.id === v) ? v : ""; } catch { return ""; }
};
const gfUrl = (id) => "https://fonts.googleapis.com/css2?family=" + encodeURIComponent(id).replace(/%20/g, "+") + ":wght@400;700&display=swap";
// يطبّق الخط على كل الصفحة؛ ولا يضيف رابط Google Fonts إلا للخط المختار حالياً (وغير المحلي)
function applyFont(id, onState) {
  const f = FONTS.find((x) => x.id === id);
  let st = document.getElementById("sg-font-css"), lk = document.getElementById("sg-font-link");
  if (!f) {
    if (st) st.remove(); if (lk) lk.remove();
    document.documentElement.removeAttribute("data-sg-font");
    if (onState) onState("ok");
    return;
  }
  if (f.local) {
    if (lk) lk.remove();
    if (f.file && document.fonts && document.fonts.load) {
      // الخط المدمج ملفه داخل الموقع؛ إن لم يوجد الملف نرجع لـ Google Fonts تلقائياً
      document.fonts.load('400 1em "' + f.id + '"').then((r) => {
        if (r && r.length) { if (onState) onState("ok"); return; }
        const l2 = document.getElementById("sg-font-link") || h("link", { id: "sg-font-link", rel: "stylesheet" });
        if (!l2.isConnected) document.head.append(l2);
        l2.setAttribute("href", gfUrl(f.id));
        if (onState) onState("ok");
      }).catch(() => { if (onState) onState("ok"); });
    } else if (onState) onState("ok");
  }
  else {
    const href = gfUrl(f.id);
    if (!lk) { lk = h("link", { id: "sg-font-link", rel: "stylesheet" }); document.head.append(lk); }
    if (lk.getAttribute("href") !== href) {
      if (onState) onState("loading");
      lk.onload = () => { if (onState) onState("ok"); };
      lk.onerror = () => { if (onState) onState("err"); };
      lk.setAttribute("href", href);
    } else if (onState) onState("ok");
  }
  if (!st) { st = h("style", { id: "sg-font-css" }); document.head.append(st); }
  st.textContent = `html[data-sg-font] body,html[data-sg-font] body *{font-family:"${f.id}",Cairo,Tajawal,sans-serif !important}`;
  document.documentElement.setAttribute("data-sg-font", f.id);
}
function buildFontGroup() {
  const en = lang() === "en";
  const cur = savedFont();
  const status = h("p", { id: "sg-font-status", class: "sound-help-text", role: "status", "aria-live": "polite" });
  const nameB = h("b", {}, cur || (en ? "Default" : "الافتراضي"));
  let value = cur;
  const groups = [
    { label: en ? "Built-in fonts (work offline)" : "خطوط مدمجة (تعمل دون إنترنت)", fonts: FONTS.filter((f) => f.local) },
    { label: en ? "Google Fonts (loaded when selected)" : "خطوط Google Fonts (تُحمَّل عند الاختيار)", fonts: FONTS.filter((f) => !f.local) }
  ];
  const defLabel = en ? "Default (Cairo + Tajawal)" : "الافتراضي (Cairo + Tajawal)";
  const labelOf = (v) => v || defLabel;
  const trigger = h("button", { type: "button", class: "sg-fsel sg-fdd-btn", id: "sg-font-select", "aria-haspopup": "listbox", "aria-expanded": "false", "aria-label": en ? "Site font" : "خط الموقع" },
    h("span", { class: "sg-fdd-cur" }, labelOf(cur)), h("span", { class: "sg-fdd-arrow", "aria-hidden": "true" }, "▾"));
  const panel = h("div", { class: "sg-fdd-panel", role: "listbox", hidden: true, tabindex: "-1" });
  const optEls = [];
  const SAMPLE = "أبجد هوز 123";
  const addOpt = (v, text, fontFam) => {
    const o = h("div", { class: "sg-fdd-opt", role: "option", "data-v": v, tabindex: "-1", "aria-selected": String(v === value) },
      h("span", { class: "sg-fdd-name" }, text),
      v ? h("span", { class: "sg-fdd-sample", dir: "rtl", style: 'font-family:"' + v + '",Cairo,Tajawal,sans-serif' }, SAMPLE) : null);
    o.addEventListener("click", () => choose(v));
    optEls.push(o); panel.append(o);
  };
  const addHead = (t) => panel.append(h("div", { class: "sg-fdd-head", role: "presentation" }, t));
  addOpt("", defLabel);
  for (const g of groups) { addHead(g.label); for (const f of g.fonts) addOpt(f.id, f.id, f.local ? f.id : null); }
  const close = () => { panel.hidden = true; trigger.setAttribute("aria-expanded", "false"); };
  let previewsLoaded = false;
  // معاينة خطوط Google: نحمّل لكل خط ملفاً صغيراً جداً (أحرف المثال فقط) عند فتح القائمة؛ وبدون إنترنت يظهر المثال بالخط الافتراضي
  const loadPreviews = () => {
    if (previewsLoaded || !navigator.onLine) return;
    previewsLoaded = true;
    for (const f of FONTS.filter((x) => !x.local)) {
      const l = h("link", { rel: "stylesheet", "data-sg-prev": "1",
        href: "https://fonts.googleapis.com/css2?family=" + encodeURIComponent(f.id).replace(/%20/g, "+") + "&text=" + encodeURIComponent(SAMPLE) + "&display=swap" });
      document.head.append(l);
    }
  };
  const open = () => {
    loadPreviews();
    panel.hidden = false; trigger.setAttribute("aria-expanded", "true");
    const sel = optEls.find((o) => o.dataset.v === value) || optEls[0];
    sel.scrollIntoView({ block: "nearest" }); sel.focus();
  };
  function choose(v) {
    value = FONTS.some((f) => f.id === v) ? v : "";
    optEls.forEach((o) => o.setAttribute("aria-selected", String(o.dataset.v === value)));
    trigger.querySelector(".sg-fdd-cur").textContent = labelOf(value);
    close(); trigger.focus();
    try { if (value) localStorage.setItem(LS_FONT, value); else localStorage.removeItem(LS_FONT); } catch { /* ignore */ }
    nameB.textContent = value || (en ? "Default" : "الافتراضي");
    applyFont(value, (stt) => {
      status.textContent = stt === "loading" ? (en ? "Loading font…" : "جارٍ تحميل الخط…")
        : stt === "err" ? (en ? "Couldn't load the font. Check your connection; a built-in font is used meanwhile." : "تعذّر تحميل الخط. تحقق من الاتصال بالإنترنت؛ يُستخدم خط مدمج مؤقتاً.")
        : "";
    });
  }
  trigger.addEventListener("click", () => (panel.hidden ? open() : close()));
  panel.addEventListener("keydown", (e) => {
    const i = optEls.indexOf(document.activeElement);
    if (e.key === "ArrowDown") { e.preventDefault(); (optEls[Math.min(optEls.length - 1, i + 1)] || optEls[0]).focus(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); (optEls[Math.max(0, i - 1)] || optEls[0]).focus(); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (i >= 0) choose(optEls[i].dataset.v); }
    else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(); trigger.focus(); }
    else if (e.key === "Tab") close();
  });
  document.addEventListener("pointerdown", (e) => { if (!panel.hidden && !panel.contains(e.target) && !trigger.contains(e.target)) close(); });
  const sel = h("div", { class: "sg-fdd" }, trigger, panel);
  return h("div", { class: "settings-group", id: "sg-font-group" },
    h("div", { class: "setting-label" }, svgIcon("type", 18), h("span", {}, en ? "Site font" : "خط الموقع"), nameB),
    sel,
    h("p", { class: "sound-help-text" }, en
      ? "Cairo, Tajawal and Amiri are built in. The other 13 fonts load from Google Fonts only when you pick them. Your choice is saved on this device."
      : "الخطوط Cairo و Tajawal و Amiri مدمجة في الموقع، أما الخطوط الـ13 الأخرى فتُحمَّل من Google Fonts عند اختيارها فقط. يُحفظ اختيارك على هذا الجهاز."),
    status);
}
function mountFontPicker() {
  const modal = document.querySelector(".settings-modal");
  if (!modal) return;
  const g = document.getElementById("sg-font-group");
  if (g && modal.contains(g)) return;
  if (g) g.remove();
  const mine = buildFontGroup();
  const anchor = modal.querySelector(".theme-sections") || modal.querySelector(".settings-actions");
  if (anchor) anchor.before(mine); else modal.append(mine);
}

const tickerEl = h("div", { id: "sg-ticker", class: "ticker", role: "note", hidden: true });
const dashEl = h("section", { id: "sg-dash", "aria-label": "المستجدات الدراسية", hidden: true });
const origTicker = () => document.querySelector(".ticker:not(#sg-ticker)");
const newsText = (n) => (lang() === "en" && n.en ? n.en : n.text);
const hasNews = () => sorted("news").some((n) => n.text);

// شريط الأخبار الأصلي للموقع يُستبدل بشريطنا (بنفس التصميم) عندما توجد أخبار أو يكون المدير داخلاً
function syncTicker() {
  const orig = origTicker();
  if (orig) { if (tickerEl.nextElementSibling !== orig) orig.before(tickerEl); }
  else if (!tickerEl.isConnected) {
    const root = document.getElementById("root");
    if (root && root.childElementCount) root.before(tickerEl);
  }
  const mine = state.admin || hasNews();
  tickerEl.hidden = !mine;
  if (orig) orig.style.display = mine ? "none" : "";
}
function mountDash() {
  const main = document.querySelector("main");
  if (!main) return false;
  const anchor = main.querySelector(":scope > .quick-strip") || main.querySelector(":scope > .hero");
  if (dashEl.isConnected && main.contains(dashEl) && (!anchor || dashEl.previousElementSibling === anchor)) return true;
  if (anchor) anchor.after(dashEl); else main.prepend(dashEl);
  return true;
}

function renderTicker() {
  const news = sorted("news").filter((n) => n.text);
  tickerEl.replaceChildren();
  syncTicker();
  if (tickerEl.hidden) return;

  const orig = origTicker();
  const icon = orig && orig.querySelector("svg") ? orig.querySelector("svg") : null;
  const marquee = h("div", { class: "ticker-marquee" });
  tickerEl.append(marquee);

  const buildTrack = (reps) => {
    const track = h("div", { class: "ticker-track" });
    for (let copy = 0; copy < 2; copy++) {
      for (let r = 0; r < reps; r++) {
        for (const n of news) {
          const u = safeUrl(n.link);
          const label = newsText(n);
          track.append(h("span", { "aria-hidden": copy ? "true" : null },
            icon ? icon.cloneNode(true) : null,
            u ? h("a", { href: u, target: "_blank", rel: "noopener noreferrer", tabindex: copy ? "-1" : null }, label) : label));
        }
      }
    }
    return track;
  };

  if (news.length) {
    let track = buildTrack(1);
    marquee.append(track);
    requestAnimationFrame(() => {
      const half = track.scrollWidth / 2 || 1;
      const reps = Math.max(1, Math.ceil((marquee.clientWidth || 600) / half));
      if (reps > 1) { const t2 = buildTrack(reps); track.replaceWith(t2); track = t2; }
      track.style.animationDuration = Math.max(20, Math.round(track.scrollWidth / 2 / 55)) + "s";
    });
  } else {
    marquee.append(h("div", { class: "ticker-track", style: "animation:none" }, h("span", {}, "لا توجد أخبار بعد. اضغط «إدارة الأخبار» لإضافة أول خبر أو لاستيراد رسائل الشريط الحالية.")));
  }

  if (state.admin) tickerEl.append(h("button", { type: "button", class: "sg-tk-edit", onclick: openNewsManager }, "✎ إدارة الأخبار"));
}

function itemShell(col, it, body) {
  return h("div", { class: "sg-item" + (col === "homework" && isDone(it.id) ? " sg-done" : "") },
    h("div", { class: "sg-item-b" }, body),
    state.admin ? h("div", { class: "sg-ctl" },
      iconBtn("تعديل", "✎", () => openItemForm(col, it)),
      iconBtn("حذف", "🗑", () => deleteItem(col, it), "sg-del")) : null);
}

function renderItem(col, it) {
  if (col === "homework") {
    return itemShell(col, it, [
      h("div", { class: "sg-row" }, chip(it.subject), chip(it.group, "sg-chip-soft"), dueBadge(it.due, "التسليم"), isDone(it.id) ? h("span", { class: "sg-badge" }, "✓ منجز") : null),
      h("p", { class: "sg-txt", dir: "auto" }, it.text),
      it.due ? h("p", { class: "sg-meta" }, "📅 " + fmtDay(it.due)) : null,
      Array.isArray(it.imgs) && it.imgs.length ? h("button", { type: "button", class: "secondary-cta", onclick: () => openGallery(it.imgs) }, `📷 عرض الصور (${it.imgs.length})`) : null,
      linkBtn(it.link, it.linkLabel || "فتح المرفق"),
      h("div", { class: "sg-acts" }, doneBtn(it), (() => {
        const b = h("button", {
          type: "button", class: "share-resource sg-share",
          "aria-label": "مشاركة الواجب عبر واتساب", title: "مشاركة الواجب عبر واتساب",
          onclick: (e) => shareHomework(it, e.currentTarget)
        }, svgIcon("share", 16), h("span", {}, Array.isArray(it.imgs) && it.imgs.length ? "مشاركة مع الصور" : "مشاركة"));
        if (Array.isArray(it.imgs) && it.imgs.length) watchVisible(b, it.imgs);
        return b;
      })())
    ]);
  }
  if (col === "exams") {
    return itemShell(col, it, [
      h("div", { class: "sg-row" }, chip(it.subject), chip(it.group, "sg-chip-soft"), dueBadge(it.date)),
      it.title ? h("p", { class: "sg-title", dir: "auto" }, it.title) : null,
      (fmtDay(it.date) || it.time) ? h("p", { class: "sg-meta" }, [fmtDay(it.date) ? "📅 " + fmtDay(it.date) : "", it.time ? "⏰ " + it.time : ""].filter(Boolean).join(" · ")) : null,
      it.note ? h("p", { class: "sg-txt", dir: "auto" }, it.note) : null,
      linkBtn(it.link, it.linkLabel || "رابط تقديم الاختبار", true)
    ]);
  }
  if (col === "live") {
    const isLive = it.kind !== "rec";
    return itemShell(col, it, [
      h("div", { class: "sg-row" },
        h("span", { class: "sg-chip" }, isLive ? h("span", { class: "sg-live-dot" }, "●") : "▶", isLive ? " حصة مباشرة" : " تسجيل"),
        chip(it.subject, "sg-chip-soft"), chip(it.group, "sg-chip-soft")),
      it.title ? h("p", { class: "sg-title", dir: "auto" }, it.title) : null,
      (it.teacher || it.when) ? h("p", { class: "sg-meta" }, [it.teacher ? "👤 " + it.teacher : "", it.when ? "🕒 " + it.when : ""].filter(Boolean).join(" · ")) : null,
      linkBtn(it.link, isLive ? "انضم للحصة" : "شاهد التسجيل", true)
    ]);
  }
  if (col === "progress") {
    const pct = pctOf(it.pct);
    return itemShell(col, it, [
      h("div", { class: "sg-row" }, chip(it.subject), chip(it.group, "sg-chip-soft"), h("span", { class: "sg-badge" }, pct + "%")),
      h("div", { class: "sg-pg", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": String(pct), "aria-label": (it.subject || "") + " " + pct + "%" },
        h("span", { style: `width:${pct}%` })),
      it.unit ? h("p", { class: "sg-title", dir: "auto" }, "📍 " + it.unit) : null,
      it.next ? h("p", { class: "sg-meta", dir: "auto" }, "⏭ القادم: " + it.next) : null,
      it.note ? h("p", { class: "sg-txt", dir: "auto" }, it.note) : null,
      h("div", { class: "sg-acts" }, shareBtn(secName("progress"), [
        [it.subject, it.group].filter(Boolean).join(" - ") + ": " + pct + "%",
        it.unit ? "📍 " + it.unit : "",
        it.next ? "⏭ " + it.next : ""
      ]))
    ]);
  }
  if (col === "summaries") {
    const k = SUM_KINDS[it.kind] || SUM_KINDS.file;
    return itemShell(col, it, [
      h("div", { class: "sg-row" }, h("span", { class: "sg-chip" }, k[0] + " " + k[1]), chip(it.subject, "sg-chip-soft"), chip(it.group, "sg-chip-soft")),
      it.title ? h("p", { class: "sg-title", dir: "auto" }, it.title) : null,
      it.text ? h("p", { class: "sg-txt", dir: "auto" }, it.text) : null,
      linkBtn(it.link, it.linkLabel || k[2], true),
      ...(Array.isArray(it.files) ? it.files.filter((x) => FILE_ID.test(String(x))).slice(0, MAX_FILES).map((fid, i) =>
        h("button", { type: "button", class: "secondary-cta sg-filebtn", onclick: (e) => downloadStoredFile(fid, (it.fnames || [])[i], e.currentTarget) },
          "📎 " + (clean((it.fnames || [])[i], 80) || "تحميل الملف"))) : []),
      h("div", { class: "sg-acts" }, shareBtn(secName("summaries"), [
        [it.subject, it.group].filter(Boolean).join(" - "), it.title, it.text, safeUrl(it.link)
      ]))
    ]);
  }
  if (col === "groups") {
    const p = PLATFORMS[it.platform] || PLATFORMS.other;
    return itemShell(col, it, [
      h("div", { class: "sg-row" }, h("span", { class: "sg-chip" }, p[0] + " " + p[1]), chip(it.subject, "sg-chip-soft"), chip(it.group, "sg-chip-soft")),
      it.name ? h("p", { class: "sg-title", dir: "auto" }, it.name) : null,
      it.note ? h("p", { class: "sg-txt", dir: "auto" }, it.note) : null,
      linkBtn(it.link, "انضم للمجموعة", true),
      h("div", { class: "sg-acts" }, shareBtn(secName("groups"), [
        it.name, [p[1], it.subject, it.group].filter(Boolean).join(" - "), safeUrl(it.link)
      ]))
    ]);
  }
  // teachers
  const tel = phoneTel(it.phone), wa = waNumber(it.phone);
  return itemShell(col, it, [
    h("div", { class: "sg-row" }, h("p", { class: "sg-title", dir: "auto" }, it.name), chip(it.subject), chip(it.group, "sg-chip-soft")),
    tel ? h("div", { class: "sg-ic-btns" },
      h("a", { class: "secondary-cta", href: "tel:" + tel, "aria-label": "اتصال بـ " + it.name }, "📞 اتصال"),
      wa ? h("a", { class: "secondary-cta", href: "https://wa.me/" + wa, target: "_blank", rel: "noopener noreferrer", "aria-label": "واتساب مع " + it.name }, "💬 واتساب") : null,
      h("span", { class: "sg-meta", dir: "ltr", style: "align-self:center" }, it.phone)) : null,
    h("div", { class: "sg-acts" }, shareBtn(secName("teachers"), [
      it.name,
      [it.subject, it.group].filter(Boolean).join(" - "),
      it.phone ? "📞 " + it.phone : ""
    ]))
  ]);
}

const ICON_PATHS = {
  homework: '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
  exams: '<path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/>',
  live: '<path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
  teachers: '<path d="M18 21a8 8 0 0 0-16 0"/><circle cx="10" cy="8" r="5"/><path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3"/>'
};
ICON_PATHS.share = '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.42" x2="8.59" y1="6.51" y2="10.49"/>';
ICON_PATHS.ext = '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>';
ICON_PATHS.yt = '<path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/>';
ICON_PATHS.plus = '<path d="M5 12h14"/><path d="M12 5v14"/>';
ICON_PATHS.progress = '<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>';
ICON_PATHS.summaries = '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>';
ICON_PATHS.groups = '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>';
ICON_PATHS.type = '<polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/>';
function svgIcon(col, size = 24) {
  const span = document.createElement("span");
  span.style.display = "inline-grid";
  span.style.placeItems = "center";
  span.setAttribute("aria-hidden", "true");
  span.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[col]}</svg>`;
  return span;
}
const YT_URL = "https://youtube.com/@gazdi-e6i?si=fgK1amanriWXQ3dZ";
const SEC_ALIAS = {
  homework: ["واجب", "واجبات", "تكليف", "تكاليف", "وظيفة", "وظائف", "homework", "assignment"],
  exams: ["امتحان", "امتحانات", "اختبار", "اختبارات", "فحص", "exam", "exams", "test"],
  live: ["حصة", "حصص", "تسجيل", "تسجيلات", "بث", "مباشر", "يوتيوب", "youtube", "live", "recording", "قناة"],
  teachers: ["مدرس", "مدرسين", "معلم", "معلمين", "استاذ", "اساتذة", "رقم", "ارقام", "teacher", "teachers", "تواصل"],
  progress: ["تقدم", "التقدم", "منهج", "المنهج", "انجاز", "نسبه", "وحده", "progress", "curriculum", "syllabus"],
  summaries: ["تلخيص", "تلخيصات", "ملخص", "ملخصات", "ملف", "ملفات", "ورقه عمل", "summary", "summaries", "files", "notes", "pdf"],
  groups: ["مجموعه", "مجموعات", "جروب", "قروب", "واتساب", "تيليجرام", "تلغرام", "telegram", "whatsapp", "group", "groups"]
};
const GENERAL_ALIAS = ["متابعة", "يومية", "مستجدات", "updates", "daily"];
const nq = (v) => normAr(v).split(" ").filter(Boolean).map((w) => (w.length > 3 && w.startsWith("ال") ? w.slice(2) : w)).join(" ");
const itemHay = (it) => nq(["subject", "text", "title", "name", "teacher", "group", "note", "when", "kind", "unit", "next"].map((k) => it[k] || "").join(" "));
function sectionMatches(col, q) {
  const k = nq(q);
  if (k.length < 2) return false;
  const def = COLS[col];
  const names = [def.ar, def.en, ...SEC_ALIAS[col], ...GENERAL_ALIAS].map(nq);
  return names.some((a) => a.includes(k) || (a.length >= 3 && k.includes(a)));
}
function searchHits(q) {
  const k = nq(q);
  const out = [];
  if (k.length < 2) return out;
  for (const col of visibleCards()) {
    const def = COLS[col];
    if (sectionMatches(col, q)) out.push({ col, title: def.ar, sub: "المتابعة اليومية · " + cardSummary(col), sec: true });
  }
  for (const col of visibleCards()) {
    const def = COLS[col];
    for (const it of sorted(col)) {
      if (!itemHay(it).includes(k)) continue;
      const main = col === "teachers" || col === "groups" ? it.name : (it.title || it.text || it.subject || "");
      out.push({ col, title: clean(main, 70) || def.ar, sub: `${def.ar}${it.subject && col !== "teachers" ? " · " + it.subject : it.subject ? " · " + it.subject : ""}` });
      if (out.length >= 8) return out;
    }
  }
  return out.slice(0, 8);
}
function syncSearch() {
  const q = state.q.trim();
  const box = document.querySelector(".hero-search-results");
  const hits = q ? searchHits(q) : [];
  document.body.classList.toggle("sg-search-hit", hits.length > 0);
  let mine = document.getElementById("sg-sres");
  if (!box || !hits.length) { if (mine) mine.remove(); return; }
  const sig = hits.map((x) => x.col + "|" + x.title + "|" + x.sub).join("§");
  if (!mine) mine = h("div", { id: "sg-sres" });
  if (mine.dataset.sig !== sig) {
    mine.dataset.sig = sig;
    mine.replaceChildren(...hits.map((x) => h("button", { type: "button", class: "search-suggestion", onclick: () => openSection(x.col) },
      h("span", {}, h("b", {}, x.title), h("small", {}, x.sub)))));
  }
  if (box.firstChild !== mine) box.prepend(mine);
}
function readSearch() {
  const inp = document.querySelector(".hero-search input");
  const v = inp ? inp.value : "";
  if (v !== state.q) { state.q = v; renderDash(); }
  syncSearch();
}

const TONES = { homework: "tone-olive", exams: "tone-coral", live: "tone-blue", teachers: "tone-gold", progress: "tone-green", summaries: "tone-teal", groups: "tone-plum" };
const EYEBROW = { homework: ["الواجبات", "HOMEWORK"], exams: ["الامتحانات", "EXAMS"], live: ["مباشر ومسجّل", "LIVE"], teachers: ["للتواصل", "CONTACT"], progress: ["المنهج", "CURRICULUM"], summaries: ["للمراجعة", "STUDY FILES"], groups: ["للانضمام", "GROUPS"] };
const OPEN_LABEL = { homework: "عرض الواجبات", exams: "عرض الامتحانات", live: "عرض الحصص", teachers: "عرض الأرقام", progress: "عرض التقدم", summaries: "عرض التلخيصات", groups: "عرض المجموعات" };

function cardSummary(col) {
  const a = items(col);
  const def = COLS[col];
  if (!a.length) return def.empty;
  if (col === "homework") {
    const tot = a.length, rem = a.filter((x) => !isDone(x.id)).length;
    if (!rem) return `أنجزت كل الواجبات (${tot}) 🎉`;
    const next = sorted(col).find((x) => { const d = dayDiff(x.due); return !isDone(x.id) && d !== null && d >= 0; });
    const head = next ? `الأقرب تسليماً: ${next.subject || ""} — ${rel(dayDiff(next.due))}` : `${tot} من الواجبات المسجّلة`;
    return `${head} · المتبقي ${rem} من ${tot}`;
  }
  if (col === "exams") {
    const next = sorted(col).find((x) => { const d = dayDiff(x.date); return d !== null && d >= 0; });
    if (next) return `القادم: ${next.subject || ""} — ${rel(dayDiff(next.date))}`;
    return `${a.length} من الامتحانات المسجّلة`;
  }
  if (col === "live") {
    const live = a.filter((x) => x.kind !== "rec").length;
    return `${live} حصة مباشرة · ${a.length - live} تسجيل`;
  }
  if (col === "progress") {
    const avg = Math.round(a.reduce((t, x) => t + pctOf(x.pct), 0) / a.length);
    const n = new Set(a.map((x) => classify(x.subject).key)).size;
    return `متوسط الإنجاز ${avg}% — ${n} من المواد`;
  }
  if (col === "summaries") return `${a.length} من التلخيصات والملفات`;
  if (col === "groups") return `${a.length} من المجموعات`;
  return `${a.length} من المدرسين حسب المادة`;
}

// ---- إخفاء بطاقات المتابعة اليومية (المدير يتحكم) + إخفاء تلقائي للبطاقات الفارغة عن الطلاب ----
function hiddenCards() {
  try {
    const j = state.data.settings && state.data.settings.json;
    const o = typeof j === "string" && j.length < 2000 ? JSON.parse(j) : null;
    return new Set(o && Array.isArray(o.hidden) ? o.hidden.filter((c) => CARDS.includes(c)) : []);
  } catch { return new Set(); }
}
const AUTO_KEEP = new Set(["live"]); // بطاقة الحصص فيها زر قناة يوتيوب فتبقى ظاهرة حتى لو فارغة
const cardShown = (col) => state.admin || (!hiddenCards().has(col) && (items(col).length > 0 || AUTO_KEEP.has(col)));
const visibleCards = () => CARDS.filter(cardShown);
async function setCardHidden(col, hide) {
  try {
    const { dbM, d } = await wctx();
    const set = hiddenCards();
    if (hide) set.add(col); else set.delete(col);
    await dbM.set(dbM.ref(d, "content/settings"), { json: JSON.stringify({ hidden: [...set] }), upd: Date.now() });
    toast(hide ? "تم إخفاء البطاقة عن الطلاب" : "البطاقة ظاهرة للطلاب الآن");
  } catch (ex) { toast(writeError(ex).userMessage); }
}

function renderCard(col, idx) {
  const def = COLS[col];
  const en = lang() === "en";
  const total = items(col).length;
  const hiddenNow = hiddenCards().has(col);
  const emptyNow = !total && !AUTO_KEEP.has(col);
  return h("article", { class: `resource-card ${TONES[col]}` + (state.admin && (hiddenNow || emptyNow) ? " sg-card-off" : ""), style: `animation-delay:${idx * 45}ms` },
    state.admin && (hiddenNow || emptyNow) ? h("span", { class: "sg-off-badge" }, hiddenNow ? "مخفية عن الطلاب" : "فارغة — مخفية تلقائياً عن الطلاب") : null,
    h("div", { class: "resource-card-top" },
      h("div", { class: "resource-icon", "aria-hidden": "true" }, svgIcon(col, 24)),
      h("span", { class: "paper-tab" }, EYEBROW[col][en ? 1 : 0])),
    h("h3", {}, def[lang()]),
    h("p", {}, cardSummary(col), updEl(colLast(col), "sg-upd-in")),
    (() => {
      const extras = [
        col === "live" ? h("a", { class: "copy-resource", href: YT_URL, target: "_blank", rel: "noopener noreferrer", "aria-label": "قناة تسجيلات الحصص على يوتيوب", title: "قناة تسجيلات الحصص على يوتيوب" },
          svgIcon("yt", 15), h("span", {}, "قناة يوتيوب")) : null,
        col === "homework" ? homeworkCardShareBtn() : col !== "live" ? shareBtn(secName(col), cardShareLines(col)) : null,
        state.admin ? h("button", { type: "button", class: "copy-resource", onclick: () => setCardHidden(col, !hiddenNow), "aria-label": hiddenNow ? "إظهار للطلاب" : "إخفاء عن الطلاب", title: hiddenNow ? "إظهار للطلاب" : "إخفاء عن الطلاب" },
          h("span", {}, hiddenNow ? "👁 إظهار للطلاب" : "🚫 إخفاء عن الطلاب")) : null,
        state.admin ? h("button", { type: "button", class: "copy-resource", onclick: () => openItemForm(col, null), "aria-label": "إضافة", title: "إضافة" },
          svgIcon("plus", 15), h("span", {}, "إضافة")) : null
      ].filter(Boolean);
      return h("div", { class: "resource-card-actions sg-multi" + (extras.length > 1 ? " sg-full" : "") },
        h("button", { type: "button", class: "card-open", onclick: () => openSection(col) },
          `${OPEN_LABEL[col]} (${total})`, " ", svgIcon("ext", 17)),
        extras);
    })());
}

const SUBJ_FILTER = { homework: "واجبات ", summaries: "" };
function openSection(col) {
  const def = COLS[col];
  const d = openDialog([]);
  d.classList.add("sg-wide");
  const inner = d.firstChild;
  const draw = () => {
    const keep = inner.scrollTop;
    const act = document.activeElement;
    const focusKey = act && inner.contains(act)
      ? (act.getAttribute("data-done-btn") ? "d:" + act.getAttribute("data-done-btn") : act.hasAttribute("data-hide-done") ? "hide" : "") : "";
    const total = items(col).length;
    let all = sorted(col);
    let subjects = null;
    if (SUBJ_FILTER[col] !== undefined) {
      const groups = subjectGroups(col);
      if (state.filter.subj[col] && !groups.some((g) => g.key === state.filter.subj[col])) delete state.filter.subj[col];
      const cur = state.filter.subj[col] || null;
      if (cur) all = all.filter((it) => classify(it.subject).key === cur);
      if (groups.length) {
        subjects = h("div", { class: "support-actions sg-subjects", role: "group", "aria-label": "تصفية حسب المادة" },
          h("button", { type: "button", "aria-pressed": String(!cur), onclick: () => { delete state.filter.subj[col]; draw(); } }, `الكل (${total})`),
          groups.map((g) => h("button", { type: "button", "aria-pressed": String(cur === g.key), onclick: () => { state.filter.subj[col] = g.key; draw(); } }, `${SUBJ_FILTER[col]}${g.label} (${g.count})`)));
      }
    }
    const gs = groupsOf(col);
    if (state.filter.grp[col] && !gs.some((g) => g.name === state.filter.grp[col])) delete state.filter.grp[col];
    const curG = state.filter.grp[col] || null;
    if (curG) all = all.filter((it) => it.group === curG);
    const groupBar = gs.length > 1 ? h("div", { class: "support-actions sg-subjects", role: "group", "aria-label": "تصفية حسب الصف" },
      h("button", { type: "button", "aria-pressed": String(!curG), onclick: () => { delete state.filter.grp[col]; draw(); } }, "كل الصفوف"),
      gs.map((g) => h("button", { type: "button", "aria-pressed": String(curG === g.name), onclick: () => { state.filter.grp[col] = g.name; draw(); } }, `${g.name} (${g.count})`))) : null;
    // عدّاد المتبقي وإخفاء المنجز (الواجبات فقط) يحسبان ضمن التصفية الحالية
    let doneBar = null, emptyMsg = def.empty;
    if (col === "homework") {
      const tot = all.length, rem = all.filter((it) => !isDone(it.id)).length;
      if (hideDone()) { all = all.filter((it) => !isDone(it.id)); if (tot && !all.length) emptyMsg = "كل الواجبات منجزة ومخفية. ألغِ «إخفاء المنجز» لعرضها."; }
      if (tot) doneBar = h("div", { class: "sg-donebar" },
        h("span", { class: "sg-count", role: "status", "aria-live": "polite" }, rem ? `المتبقي: ${rem} من ${tot}` : `🎉 أنجزت كل الواجبات (${tot})`),
        h("label", { class: "sg-hide" },
          h("input", { type: "checkbox", "data-hide-done": "1", checked: hideDone(), onchange: (e) => setHideDone(e.target.checked) }), "إخفاء المنجز"));
    }
    const yt = col === "live" ? h("div", { class: "sg-acts" }, h("a", { class: "secondary-cta", href: YT_URL, target: "_blank", rel: "noopener noreferrer" }, "▶ قناة تسجيلات الحصص (يوتيوب)")) : null;
    inner.replaceChildren(...[
      dlgHead([svgIcon(col, 22), ` ${def[lang()]} (${total})`], d),
      updEl(colLast(col), "sg-upd-dlg"),
      yt,
      state.admin ? h("div", { class: "sg-acts" }, h("button", { type: "button", class: "primary-cta", onclick: () => openItemForm(col, null) }, "＋ إضافة " + def.one)) : null,
      groupBar,
      subjects,
      doneBar,
      all.length ? h("div", { class: "sg-list" }, all.map((it) => renderItem(col, it))) : h("p", { class: "sg-empty" }, emptyMsg)].filter(Boolean));
    inner.scrollTop = keep;
    if (focusKey) {
      const el = focusKey === "hide" ? inner.querySelector("[data-hide-done]")
        : (inner.querySelector('[data-done-btn="' + focusKey.slice(2).replace(/["\\]/g, "") + '"]') || inner.querySelector("[data-hide-done]"));
      if (el) el.focus({ preventScroll: true });
    }
  };
  draw();
  listeners.push(draw);
  d.addEventListener("close", () => { const i = listeners.indexOf(draw); if (i >= 0) listeners.splice(i, 1); });
}

function renderDash() {
  const en = lang() === "en";
  const q = state.q.trim();
  const shown = visibleCards();
  const cols = q ? shown.filter((c) => sectionMatches(c, q) || searchHits(q).some((x) => x.col === c)) : shown;
  dashEl.hidden = !cols.length;
  if (!cols.length) { dashEl.replaceChildren(); return; }
  dashEl.replaceChildren(
    h("div", { class: "section-heading" },
      h("div", {}, h("div", { class: "section-tab" }, en ? "UPDATES" : "المتابعة اليومية"),
        h("h2", {}, en ? "Study updates" : "مستجدات الدراسة"))),
    h("div", { class: "resource-grid sg-res" }, cols.map((c, i) => renderCard(c, i))));
  mountDash();
}

function renderAdminBar() {
  document.querySelectorAll(".sg-bar").forEach((b) => b.remove());
  if (!state.admin) return;
  document.body.append(h("div", { class: "sg-bar", role: "region", "aria-label": "وضع المدير" },
    h("span", { class: "sg-bar-lbl" }, h("span", { class: "sg-dot", "aria-hidden": "true" }), "وضع المدير"),
    h("button", { type: "button", class: "sg-bar-out", onclick: doLogout }, "خروج")));
}

function renderAll() {
  renderSchedule();
  renderTicker();
  renderDash();
  syncSearch();
  renderAdminBar();
  listeners.slice().forEach((f) => { try { f(); } catch { /* ignore */ } });
}

const DAY_NAMES = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const ORD = ["الأولى", "الثانية", "الثالثة", "الرابعة", "الخامسة", "السادسة", "السابعة", "الثامنة", "التاسعة", "العاشرة"];
const SCH_EN = {
  days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  ord: ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"],
  period: "Period", day: "Day", today: "Today", note: "Note: ", soon: " — coming soon",
  region: "Weekly class schedule", section: "Class schedule",
  title: "Class Schedule — 11th Grade Scientific 1 (In-person)",
  sub: "Sunday to Thursday (Saturday is off)",
  noteDef: "Numbers 1, 2 and 3 show the order of the periods during the day.",
  linkText: "Class join link", edit: "✎ Edit schedule",
  subjects: {
    "عربي": "Arabic", "العربي": "Arabic", "عربية": "Arabic", "لغة عربية": "Arabic", "اللغة العربية": "Arabic",
    "E": "English", "إنجليزي": "English", "انجليزي": "English", "إنجليزية": "English", "انجليزية": "English", "لغة إنجليزية": "English", "اللغة الإنجليزية": "English",
    "رياضيات": "Mathematics", "الرياضيات": "Mathematics",
    "دين": "Religion", "تربية إسلامية": "Islamic Education", "التربية الإسلامية": "Islamic Education",
    "كيمياء": "Chemistry", "الكيمياء": "Chemistry",
    "أحياء": "Biology", "الأحياء": "Biology", "احياء": "Biology",
    "فيزياء": "Physics", "الفيزياء": "Physics",
    "تكنولوجي": "Technology", "تكنولوجيا": "Technology", "التكنولوجيا": "Technology",
    "علوم": "Science", "العلوم": "Science", "تاريخ": "History", "جغرافيا": "Geography",
    "حاسوب": "Computer", "رياضة": "Sports", "فنون": "Arts", "فرنسي": "French", "عبري": "Hebrew",
    "وطنية": "National Education", "مدنيات": "Civics", "اجتماعيات": "Social Studies"
  },
  teachers: {
    "أ.حُسُن": "Mr. Husn", "أ.حسن": "Mr. Hasan", "أ.لبنى": "Ms. Lubna", "لبنى": "Lubna",
    "رائد": "Raed", "ريما": "Rima", "نبيل": "Nabil", "نديم": "Nadim", "ختام": "Khitam", "سالم": "Salem"
  }
};
const isEn = () => lang() === "en";
const schNorm = (t) => String(t || "").replace(/[\u064B-\u065F\u0670\u0640]/g, "").trim();
function schMap(dict, text) {
  if (!text) return text;
  if (dict[text]) return dict[text];
  const n = schNorm(text);
  for (const k of Object.keys(dict)) if (schNorm(k) === n) return dict[k];
  return text;
}
function schTime(t) {
  return String(t || "").replace(/(\d)\s*م(?![\u0600-\u06FF])/g, "$1 PM").replace(/(\d)\s*ص(?![\u0600-\u06FF])/g, "$1 AM");
}
const SP = (teacher, subject) => ({ teacher, subject, time: "" });
const DEFAULT_SCHEDULE = {
  title: "الجدول الدراسي — حادي عشر علمي 1 (داخل)",
  sub: "من يوم الأحد إلى يوم الخميس (السبت إجازة)",
  note: "الأرقام 1 و2 و3 تشير إلى ترتيب الحصص خلال اليوم.",
  linkText: "رابط دخول الحصص",
  link: "",
  days: [
    { dow: 0, periods: [SP("أ.حُسُن", "عربي"), SP("أ.لبنى", "رياضيات"), SP("رائد", "E")] },
    { dow: 1, periods: [SP("ريما", "دين"), SP("نبيل", "كيمياء"), SP("نديم", "أحياء")] },
    { dow: 2, periods: [SP("أ.لبنى", "رياضيات"), SP("نبيل", "كيمياء"), SP("ختام", "فيزياء")] },
    { dow: 3, periods: [SP("ختام", "فيزياء"), SP("سالم", "تكنولوجي"), SP("رائد", "E")] },
    { dow: 4, periods: [SP("أ.لبنى", "رياضيات"), SP("نديم", "أحياء"), SP("أ.حُسُن", "عربي")] }
  ]
};
function normSchedule(x) {
  if (!x || typeof x !== "object") return null;
  const days = (Array.isArray(x.days) ? x.days : []).slice(0, 7).map((dy) => ({
    dow: dy && Number.isInteger(dy.dow) && dy.dow >= 0 && dy.dow <= 6 ? dy.dow : 0,
    periods: (dy && Array.isArray(dy.periods) ? dy.periods : []).slice(0, 10).map((p) => ({
      subject: clean(p && p.subject, 60), teacher: clean(p && p.teacher, 60), time: clean(p && p.time, 40),
      subjectEn: clean(p && p.subjectEn, 60), teacherEn: clean(p && p.teacherEn, 60)
    }))
  }));
  return {
    title: clean(x.title, 120), sub: clean(x.sub, 120), note: clean(x.note, 200),
    titleEn: clean(x.titleEn, 120), subEn: clean(x.subEn, 120), noteEn: clean(x.noteEn, 200), linkTextEn: clean(x.linkTextEn, 40),
    linkText: clean(x.linkText, 40) || "رابط دخول الحصص", link: safeUrl(x.link || ""), days
  };
}
function getSchedule() {
  try {
    const j = state.data.schedule && state.data.schedule.json;
    if (typeof j === "string" && j.length < 30000) {
      const s = normSchedule(JSON.parse(j));
      if (s && s.days.length) return s;
    }
  } catch { /* استخدم الجدول الافتراضي */ }
  return normSchedule(DEFAULT_SCHEDULE);
}

const schedEl = h("section", { id: "sg-sched", "aria-label": "الجدول الدراسي" });
function mountSched() {
  const art = document.querySelector(".hero > .hero-art");
  if (!art) return false;
  if (art.nextElementSibling !== schedEl) art.after(schedEl);
  return true;
}
let schedDay = -1;
function renderSchedule() {
  const s = getSchedule();
  const en = isEn();
  const today = new Date().getDay();
  schedDay = today;
  schedEl.setAttribute("aria-label", en ? SCH_EN.section : "الجدول الدراسي");
  const isDefault = (v, def) => !v || v === def;
  const title = en ? (s.titleEn || (isDefault(s.title, DEFAULT_SCHEDULE.title) ? SCH_EN.title : s.title)) : (s.title || DEFAULT_SCHEDULE.title);
  const sub = en ? (s.subEn || (isDefault(s.sub, DEFAULT_SCHEDULE.sub) ? SCH_EN.sub : s.sub)) : s.sub;
  const note = en ? (s.noteEn || (isDefault(s.note, DEFAULT_SCHEDULE.note) ? SCH_EN.noteDef : s.note)) : s.note;
  const linkText = en ? (s.linkTextEn || (s.linkText === DEFAULT_SCHEDULE.linkText ? SCH_EN.linkText : s.linkText)) : s.linkText;
  const cols = Math.max(1, ...s.days.map((d) => d.periods.length));
  const head = h("tr", {}, h("th", { scope: "col" }, en ? SCH_EN.day : "اليوم"),
    Array.from({ length: cols }, (_, i) => h("th", { scope: "col" }, h("span", { class: "sg-sc-n" }, String(i + 1)),
      en ? SCH_EN.period + " " + (SCH_EN.ord[i] || i + 1) : "الحصة " + (ORD[i] || i + 1))));
  const rows = s.days.map((dy) => {
    const isToday = dy.dow === today;
    return h("tr", { class: isToday ? "sg-today" : null, "aria-current": isToday ? "date" : null },
      h("th", { scope: "row" }, en ? SCH_EN.days[dy.dow] : DAY_NAMES[dy.dow], isToday ? h("span", { class: "sg-sc-today" }, en ? SCH_EN.today : "اليوم") : null),
      Array.from({ length: cols }, (_, i) => {
        const p = dy.periods[i];
        if (!p || !(p.subject || p.teacher)) return h("td", {}, h("span", { class: "sg-sc-no" }, "—"));
        const subj = en ? (p.subjectEn || schMap(SCH_EN.subjects, p.subject)) : p.subject;
        const teach = en ? (p.teacherEn || schMap(SCH_EN.teachers, p.teacher)) : p.teacher;
        const time = en ? schTime(p.time) : p.time;
        return h("td", { "data-n": String(i + 1) },
          subj ? h("div", { class: "sg-sc-s", dir: "auto" }, subj) : null,
          teach ? h("div", { class: "sg-sc-t", dir: "auto" }, teach) : null,
          time ? h("div", { class: "sg-sc-time", dir: "auto" }, "🕒 " + time) : null);
      }));
  });
  schedEl.replaceChildren(
    h("h2", { class: "sg-sc-title" }, title),
    sub ? h("p", { class: "sg-sc-sub" }, sub) : null,
    updEl(Number(state.data.schedule && state.data.schedule.upd) || 0, "sg-upd-sc"),
    h("div", { class: "sg-sc-wrap", tabindex: "0", role: "region", "aria-label": en ? SCH_EN.region : "جدول الحصص الأسبوعي" },
      h("table", {}, h("thead", {}, head), h("tbody", {}, rows))),
    note ? h("p", {}, "✅ " + (en ? SCH_EN.note : "ملاحظة: ") + note) : null,
    h("div", { class: "sg-sc-foot" },
      s.link
        ? h("a", { class: "primary-cta hero-primary", href: s.link, target: "_blank", rel: "noopener noreferrer" }, "🔗 " + linkText)
        : h("span", { class: "sg-sc-off" }, "🔗 " + linkText + (en ? SCH_EN.soon : " — سيُضاف قريباً")),
      h("button", { type: "button", class: "share-resource sg-share sg-sc-share", onclick: openScheduleShare, "aria-label": en ? "Share schedule via WhatsApp" : "مشاركة الجدول عبر واتساب", title: en ? "Share schedule via WhatsApp" : "مشاركة الجدول عبر واتساب" },
        svgIcon("share", 16), h("span", {}, en ? "Share schedule" : "مشاركة الجدول")),
      state.admin ? h("button", { type: "button", class: "secondary-cta", onclick: openScheduleEditor }, en ? SCH_EN.edit : "✎ تعديل الجدول") : null));
  mountSched();
}
// ---- مشاركة الجدول عبر واتساب (حصص اليوم فقط أو الجدول كامل) ----
function scheduleShareLines(s, en, onlyToday) {
  const dayName = (dy) => (en ? SCH_EN.days[dy.dow] : DAY_NAMES[dy.dow]);
  const periodLine = (p, i) => {
    const subj = en ? (p.subjectEn || schMap(SCH_EN.subjects, p.subject)) : p.subject;
    const teach = en ? (p.teacherEn || schMap(SCH_EN.teachers, p.teacher)) : p.teacher;
    const time = en ? schTime(p.time) : p.time;
    const who = [subj, teach].filter(Boolean).join(" — ");
    if (!who && !time) return "";
    return `${i + 1}) ${who}${time ? ` (${time})` : ""}`;
  };
  const title = en ? (s.titleEn || (!s.title || s.title === DEFAULT_SCHEDULE.title ? SCH_EN.title : s.title)) : (s.title || DEFAULT_SCHEDULE.title);
  const sub = en ? (s.subEn || (!s.sub || s.sub === DEFAULT_SCHEDULE.sub ? SCH_EN.sub : s.sub)) : s.sub;
  const note = en ? (s.noteEn || (!s.note || s.note === DEFAULT_SCHEDULE.note ? SCH_EN.noteDef : s.note)) : s.note;
  const linkText = en ? (s.linkTextEn || (s.linkText === DEFAULT_SCHEDULE.linkText ? SCH_EN.linkText : s.linkText)) : s.linkText;
  const today = new Date().getDay();
  const days = onlyToday ? s.days.filter((dy) => dy.dow === today) : s.days.slice().sort((x, y) => x.dow - y.dow);
  const lines = [title];
  if (onlyToday) {
    lines.push((en ? "Today's classes — " : "حصص اليوم — ") + (en ? SCH_EN.days[today] : DAY_NAMES[today]));
  } else if (sub) lines.push(sub);
  lines.push("");
  const body = [];
  for (const dy of days) {
    const ps = dy.periods.map(periodLine).filter(Boolean);
    if (!ps.length) continue;
    if (!onlyToday) body.push("📅 " + dayName(dy));
    body.push(...ps);
    if (!onlyToday) body.push("");
  }
  if (!body.length) body.push(en ? "No classes today." : "لا توجد حصص اليوم.");
  lines.push(...body);
  if (!onlyToday && note) lines.push("✅ " + (en ? SCH_EN.note : "ملاحظة: ") + note);
  if (s.link) lines.push("🔗 " + linkText + ": " + s.link);
  while (lines.length && !lines[lines.length - 1]) lines.pop();
  return lines;
}
function openScheduleShare() {
  const s = getSchedule();
  const en = isEn();
  const holder = { d: null };
  const wa = (text) => "https://wa.me/?text=" + encodeURIComponent(text);
  const btn = (cls, label, onlyToday) => h("a", {
    class: cls, href: wa(shareSafe(scheduleShareLines(s, en, onlyToday).join("\n") + "\n\n" + (en ? "Source: " : "المصدر: ") + SITE_URL)), target: "_blank", rel: "noopener noreferrer",
    onclick: () => setTimeout(() => { if (holder.d) holder.d.close(); }, 300)
  }, label);
  holder.d = openDialog([
    dlgHead(en ? "Share schedule" : "مشاركة الجدول", { close: () => holder.d.close() }),
    h("p", { style: "margin:4px 0 14px;font-weight:700;line-height:1.7" }, en ? "Share today's classes only, or the full schedule?" : "هل تريد مشاركة حصص اليوم فقط؟ أم تريد مشاركة الجدول بالكامل؟"),
    h("div", { class: "sg-acts", style: "flex-direction:column;align-items:stretch" },
      btn("primary-cta", en ? "📅 Today's classes only" : "📅 حصص اليوم فقط", true),
      btn("secondary-cta", en ? "📋 Share the full schedule" : "📋 مشاركة الجدول كامل", false))
  ]);
}
// تحديث التظليل تلقائياً عند تغيّر اليوم (منتصف الليل) أو عند العودة للصفحة
setInterval(() => { if (new Date().getDay() !== schedDay) renderSchedule(); }, 30000);
document.addEventListener("visibilitychange", () => { if (!document.hidden && new Date().getDay() !== schedDay) renderSchedule(); });

async function saveSchedule(sc) {
  const { dbM, d } = await wctx();
  try { await dbM.set(dbM.ref(d, "content/schedule"), { json: JSON.stringify(sc), upd: Date.now() }); }
  catch (ex) { throw writeError(ex); }
}

function openScheduleEditor() {
  const draft = JSON.parse(JSON.stringify(getSchedule()));
  const d = openDialog([]);
  d.classList.add("sg-wide");
  const inner = d.firstChild;
  const err = h("p", { class: "sg-err", role: "alert" });
  let uid = 0;
  const field = (label, val, on, o = {}) => {
    const id = "sge" + (++uid);
    const el = h(o.area ? "textarea" : "input", { id, maxlength: String(o.max || 120), dir: o.dir || null, placeholder: o.ph || null, type: o.area ? null : "text", autocomplete: "off" });
    el.value = val || "";
    el.addEventListener("input", () => on(el.value));
    return h("div", { class: "sg-f" }, h("label", { for: id }, label), el);
  };
  const draw = () => {
    const keep = inner.scrollTop;
    const days = draft.days.map((dy, di) => h("div", { class: "sg-ed-day" },
      h("div", { class: "sg-ed-dh" },
        (() => {
          const sel = h("select", { "aria-label": "اليوم" }, DAY_NAMES.map((n, i) => h("option", { value: String(i) }, n)));
          sel.value = String(dy.dow);
          sel.addEventListener("change", () => { dy.dow = +sel.value; });
          return sel;
        })(),
        iconBtn("نقل لأعلى", "↑", () => { if (di > 0) { [draft.days[di - 1], draft.days[di]] = [draft.days[di], draft.days[di - 1]]; draw(); } }),
        iconBtn("نقل لأسفل", "↓", () => { if (di < draft.days.length - 1) { [draft.days[di + 1], draft.days[di]] = [draft.days[di], draft.days[di + 1]]; draw(); } }),
        iconBtn("حذف اليوم", "🗑", () => { if (window.confirm("حذف هذا اليوم من الجدول؟")) { draft.days.splice(di, 1); draw(); } }, "sg-del")),
      dy.periods.map((p, pi) => h("div", { class: "sg-ed-per" },
        field(`الحصة ${pi + 1} — المادة`, p.subject, (v) => { p.subject = v; }, { max: 60 }),
        field("المعلّم", p.teacher, (v) => { p.teacher = v; }, { max: 60 }),
        field("Subject (English) — اختياري", p.subjectEn, (v) => { p.subjectEn = v; }, { max: 60, dir: "ltr" }),
        field("Teacher (English) — اختياري", p.teacherEn, (v) => { p.teacherEn = v; }, { max: 60, dir: "ltr" }),
        field("الوقت (اختياري)", p.time, (v) => { p.time = v; }, { max: 40, ph: "8:00 - 8:45" }),
        iconBtn("حذف الحصة", "✕", () => { dy.periods.splice(pi, 1); draw(); }, "sg-del"))),
      dy.periods.length < 10 ? h("div", { class: "sg-acts" }, h("button", { type: "button", class: "secondary-cta", onclick: () => { dy.periods.push({ subject: "", teacher: "", time: "" }); draw(); } }, "＋ إضافة حصة")) : null));
    inner.replaceChildren(
      dlgHead("تعديل الجدول الدراسي", d),
      field("عنوان الجدول", draft.title, (v) => { draft.title = v; }),
      field("السطر الفرعي", draft.sub, (v) => { draft.sub = v; }),
      field("Title (English) — اختياري", draft.titleEn, (v) => { draft.titleEn = v; }, { dir: "ltr" }),
      field("Subtitle (English) — اختياري", draft.subEn, (v) => { draft.subEn = v; }, { dir: "ltr" }),
      ...days,
      draft.days.length < 7 ? h("div", { class: "sg-acts" }, h("button", { type: "button", class: "secondary-cta", onclick: () => {
        const used = new Set(draft.days.map((x) => x.dow));
        const dow = [0, 1, 2, 3, 4, 5, 6].find((x) => !used.has(x)) ?? 0;
        draft.days.push({ dow, periods: [{ subject: "", teacher: "", time: "" }] }); draw();
      } }, "＋ إضافة يوم")) : null,
      field("الملاحظة تحت الجدول", draft.note, (v) => { draft.note = v; }, { area: true, max: 200 }),
      field("Note (English) — اختياري", draft.noteEn, (v) => { draft.noteEn = v; }, { area: true, max: 200, dir: "ltr" }),
      field("نص زر الرابط", draft.linkText, (v) => { draft.linkText = v; }, { max: 40 }),
      field("Link button text (English) — اختياري", draft.linkTextEn, (v) => { draft.linkTextEn = v; }, { max: 40, dir: "ltr" }),
      field("رابط دخول الحصص (https://…)", draft.link, (v) => { draft.link = v; }, { max: 500, dir: "ltr" }),
      err,
      h("div", { class: "sg-acts" },
        h("button", { type: "button", class: "primary-cta", onclick: async (e) => {
          err.textContent = "";
          const link = clean(draft.link, 500);
          if (link && !safeUrl(link)) { err.textContent = "الرابط غير صالح، يجب أن يبدأ بـ https://"; return; }
          if (!draft.days.length) { err.textContent = "أضف يوماً واحداً على الأقل."; return; }
          const btn = e.currentTarget; btn.disabled = true; const lbl = btn.textContent; btn.textContent = "جارٍ الحفظ…";
          try { await saveSchedule(normSchedule(draft)); d.close(); toast("تم حفظ الجدول"); }
          catch (ex) { err.textContent = ex && ex.userMessage ? ex.userMessage : "تعذّر الحفظ."; btn.disabled = false; btn.textContent = lbl; }
        } }, "حفظ"),
        h("button", { type: "button", class: "secondary-cta", onclick: () => {
          if (!window.confirm("استرجاع الجدول الأصلي؟ ستضيع تعديلاتك غير المحفوظة.")) return;
          Object.assign(draft, JSON.parse(JSON.stringify(normSchedule(DEFAULT_SCHEDULE)))); draw();
        } }, "استرجاع الأصلي"),
        h("button", { type: "button", class: "secondary-cta", onclick: () => d.close() }, "إلغاء")));
    inner.scrollTop = keep;
  };
  draw();
}

function openDialog(inner) {
  const d = h("dialog", { class: "sg-dlg" }, h("div", { class: "sg-dlg-in" }, inner));
  d.addEventListener("close", () => d.remove());
  document.body.append(d);
  d.showModal();
  return d;
}
const dlgHead = (title, d) => h("div", { class: "sg-dlg-h" }, h("h3", { style: "display:flex;align-items:center;gap:8px" }, title),
  h("button", { type: "button", class: "close-button", "aria-label": "إغلاق", onclick: () => d.close() }, "✕"));

function openForm({ heading, fields, values = {}, submitLabel = "حفظ", onSubmit }) {
  const holder = { d: null };
  const inputs = {};
  const imgStates = {};
  const fileStates = {};
  const err = h("p", { class: "sg-err", role: "alert" });
  const form = h("form", { novalidate: true, class: "sg-dlg-in", style: "padding:0;overflow:visible" });
  if (fields.some((f) => f.list)) form.append(h("datalist", { id: "sg-subjects-dl" }, subjectSuggestions().map((x) => h("option", { value: x }))));
  const isNewItem = !values.id;
  for (const f of fields) {
    const id = "sgf-" + f.k;
    if (f.t === "images") {
      const st = { keep: Array.isArray(values[f.k]) ? values[f.k].filter((x) => IMG_ID.test(String(x))).slice(0, MAX_IMGS) : [], add: [] };
      imgStates[f.k] = st;
      const list = h("div", { class: "sg-imgs" });
      const file = h("input", { id, type: "file", accept: "image/*", multiple: true });
      const total = () => st.keep.length + st.add.length;
      const redraw = () => {
        const kids = [];
        st.keep.forEach((iid, i) => {
          const im = h("img", { alt: "صورة محفوظة " + (i + 1) });
          loadImage(iid).then((u) => { im.src = u; }).catch(() => {});
          kids.push(h("div", { class: "sg-thumb" }, im, h("button", { type: "button", "aria-label": "إزالة الصورة", onclick: () => { st.keep.splice(i, 1); redraw(); } }, "✕")));
        });
        st.add.forEach((u, i) => kids.push(h("div", { class: "sg-thumb" }, h("img", { src: u, alt: "صورة جديدة " + (i + 1) }),
          h("button", { type: "button", "aria-label": "إزالة الصورة", onclick: () => { st.add.splice(i, 1); redraw(); } }, "✕"))));
        list.replaceChildren(...kids);
        file.disabled = total() >= MAX_IMGS;
      };
      file.addEventListener("change", async () => {
        err.textContent = "";
        for (const fl of Array.from(file.files)) {
          if (total() >= MAX_IMGS) break;
          try { st.add.push(await compressImage(fl)); }
          catch (ex) { err.textContent = ex && ex.message === "too-big" ? "الصورة كبيرة جداً، اختر صورة أصغر." : "تعذّر قراءة الصورة. استخدم صورة بصيغة JPG أو PNG."; }
        }
        file.value = ""; redraw();
      });
      redraw();
      form.append(h("div", { class: "sg-f" }, h("label", { for: id }, f.l), file, list));
      continue;
    }
    if (f.t === "files") {
      const ids = Array.isArray(values.files) ? values.files : [];
      const names = Array.isArray(values.fnames) ? values.fnames : [];
      const st = { keep: ids.map((x, i) => ({ id: x, name: names[i] || "ملف" })).filter((x) => FILE_ID.test(String(x.id))).slice(0, MAX_FILES), add: [] };
      fileStates[f.k] = st;
      const rows = h("div", { class: "sg-frows" });
      const fin = h("input", { id, type: "file", multiple: true, accept: ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,image/*" });
      const tot = () => st.keep.length + st.add.length;
      const redrawF = () => {
        const kids = [];
        st.keep.forEach((x, i) => kids.push(h("div", { class: "sg-frow" }, h("span", { class: "sg-fname", dir: "auto" }, "📎 " + x.name), h("button", { type: "button", "aria-label": "إزالة الملف", onclick: () => { st.keep.splice(i, 1); redrawF(); } }, "✕"))));
        st.add.forEach((x, i) => kids.push(h("div", { class: "sg-frow" }, h("span", { class: "sg-fname", dir: "auto" }, "📎 " + x.name + " (" + fmtSize(x.size) + ")"), h("button", { type: "button", "aria-label": "إزالة الملف", onclick: () => { st.add.splice(i, 1); redrawF(); } }, "✕"))));
        rows.replaceChildren(...kids);
        fin.disabled = tot() >= MAX_FILES;
      };
      fin.addEventListener("change", async () => {
        err.textContent = "";
        for (const fl of Array.from(fin.files)) {
          if (tot() >= MAX_FILES) { err.textContent = "الحد الأقصى " + MAX_FILES + " ملفات."; break; }
          if (fl.size > MAX_FILE_BYTES) { err.textContent = "الملف «" + fl.name + "» أكبر من 10 ميغابايت."; continue; }
          try { st.add.push({ name: clean(fl.name, 80), size: fl.size, data: await readAsDataUrl(fl) }); }
          catch { err.textContent = "تعذّر قراءة الملف «" + fl.name + "»."; }
        }
        fin.value = ""; redrawF();
      });
      redrawF();
      form.append(h("div", { class: "sg-f" }, h("label", { for: id }, f.l), fin, rows));
      continue;
    }
    if (f.grp) {
      const inp = h("input", { id, maxlength: String(f.max || 200), type: "text", autocomplete: "off" });
      inp.value = values[f.k] ?? (isNewItem ? lastGroup() : "");
      inputs[f.k] = inp;
      const sugg = groupSuggestions();
      const chipsBox = h("div", { class: "support-actions sg-subjects", role: "group", "aria-label": "الصفوف المحفوظة" });
      const drawChips = () => {
        const cur = splitGroups(inp.value);
        chipsBox.replaceChildren(...sugg.map((g) => h("button", {
          type: "button", "aria-pressed": String(cur.includes(g)),
          onclick: () => {
            if (!isNewItem) { inp.value = g; drawChips(); return; }
            const c = splitGroups(inp.value); const i = c.indexOf(g);
            if (i >= 0) c.splice(i, 1); else c.push(g);
            inp.value = c.join(" ؛ "); drawChips();
          }
        }, g)));
      };
      inp.addEventListener("input", drawChips);
      drawChips();
      form.append(h("div", { class: "sg-f" }, h("label", { for: id }, f.l), inp,
        sugg.length ? chipsBox : null,
        isNewItem ? h("p", { class: "sg-meta" }, "اضغط على أكثر من صف لإضافة نفس العنصر لكل صف (أو اكتب عدة صفوف وافصل بينها بـ ؛). آخر صف استخدمته يُحفظ تلقائياً.") : null));
      continue;
    }
    let el;
    if (f.t === "area") el = h("textarea", { id, rows: "3", maxlength: String(f.max || 600) });
    else if (f.t === "select") el = h("select", { id }, f.opts.map(([v, l]) => h("option", { value: v }, l)));
    else el = h("input", {
      id, maxlength: String(f.max || 200),
      type: f.t === "date" ? "date" : f.t === "password" ? "password" : f.t === "tel" ? "tel" : f.t === "url" ? "url" : f.t === "number" ? "number" : "text",
      dir: f.t === "url" || f.t === "tel" || f.t === "number" ? "ltr" : null,
      min: f.t === "number" ? String(f.lo) : null, max: f.t === "number" ? String(f.hi) : null,
      inputmode: f.t === "number" ? "numeric" : null, step: f.t === "number" ? "1" : null,
      list: f.list ? "sg-subjects-dl" : null,
      autocomplete: f.auto || "off", autocapitalize: f.t === "text" ? null : "off"
    });
    el.value = values[f.k] ?? (f.t === "select" ? f.opts[0][0] : "");
    inputs[f.k] = el;
    form.append(h("div", { class: "sg-f" }, h("label", { for: id }, f.l + (f.req ? " *" : "")), el));
  }
  const save = h("button", { type: "submit", class: "primary-cta" }, submitLabel);
  const cancel = h("button", { type: "button", class: "secondary-cta", onclick: () => holder.d.close() }, "إلغاء");
  form.append(err, h("div", { class: "sg-acts" }, save, cancel));
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    err.textContent = "";
    const out = {};
    for (const f of fields) {
      if (f.t === "images") { out[f.k] = { keep: imgStates[f.k].keep.slice(), add: imgStates[f.k].add.slice() }; continue; }
      if (f.t === "files") { out[f.k] = { keep: fileStates[f.k].keep.slice(), add: fileStates[f.k].add.slice() }; continue; }
      out[f.k] = f.t === "password" ? inputs[f.k].value : clean(inputs[f.k].value, f.max || 600);
      if (f.req && !out[f.k]) { err.textContent = `الحقل «${f.l.replace(/\s*\(.*\)$/, "")}» مطلوب.`; inputs[f.k].focus(); return; }
      if (f.t === "url" && out[f.k] && !safeUrl(out[f.k])) { err.textContent = "الرابط غير صالح، يجب أن يبدأ بـ https://"; inputs[f.k].focus(); return; }
      if (f.t === "number" && out[f.k]) {
        const n = Number(out[f.k]);
        if (!Number.isFinite(n) || n < f.lo || n > f.hi) { err.textContent = `الحقل «${f.l.replace(/\s*\(.*\)$/, "")}» يجب أن يكون رقماً بين ${f.lo} و${f.hi}.`; inputs[f.k].focus(); return; }
        out[f.k] = String(Math.round(n));
      }
    }
    save.disabled = true; cancel.disabled = true;
    const label = save.textContent; save.textContent = "جارٍ الحفظ…";
    try {
      await onSubmit(out, err);
      holder.d.close();
    } catch (ex) {
      err.textContent = ex && ex.userMessage ? ex.userMessage : "تعذّر الحفظ. تحقق من الاتصال وحاول مرة أخرى.";
      save.disabled = false; cancel.disabled = false; save.textContent = label;
    }
  });
  holder.d = openDialog([dlgHead(heading, { close: () => holder.d.close() }), form]);
  const first = form.querySelector("input,textarea,select");
  if (first) first.focus();
  return holder.d;
}

function loadCache() {
  try {
    const c = JSON.parse(localStorage.getItem(LS_CACHE) || "null");
    if (c && typeof c === "object") for (const k of Object.keys(state.data)) if (c[k] && typeof c[k] === "object") state.data[k] = c[k];
  } catch { /* ignore */ }
}
function saveCache() { try { localStorage.setItem(LS_CACHE, JSON.stringify(state.data)); } catch { /* ignore */ } }

function initDb() {
  dbReady = (async () => {
    const [appMod, dbMod] = await Promise.all([import(SDK + "firebase-app.js"), import(SDK + "firebase-database.js")]);
    fbApp = appMod.initializeApp(FIREBASE_CONFIG);
    fbDb = dbMod;
    db = dbMod.getDatabase(fbApp);
    dbMod.onValue(dbMod.ref(db, "content"), (snap) => {
      const v = snap.val() || {};
      for (const k of Object.keys(state.data)) state.data[k] = v[k] && typeof v[k] === "object" ? v[k] : {};
      saveCache();
      pruneDone();
      renderAll();
    }, (e) => console.warn("[StudyGuide] تعذّرت قراءة المحتوى:", e && e.code));
  })().catch((e) => { console.warn("[StudyGuide] تعذّر تحميل Firebase:", e); });
  return dbReady;
}

function getAdmin() {
  if (!adminCtx) {
    adminCtx = (async () => {
      const [appM, authM, dbM] = await Promise.all([import(SDK + "firebase-app.js"), import(SDK + "firebase-auth.js"), import(SDK + "firebase-database.js")]);
      const app = appM.initializeApp(FIREBASE_CONFIG, "admin");
      const a = authM.getAuth(app);   // مهم: تهيئة المصادقة قبل قاعدة البيانات حتى يُرفق توكن المدير مع كل كتابة
      const d = dbM.getDatabase(app);
      return { authM, dbM, a, d };
    })().catch(() => { adminCtx = null; const e = new Error("offline"); e.code = "auth/network-request-failed"; throw e; });
  }
  return adminCtx;
}

async function watchAuth() {
  if (authWatching) return;
  const { authM, a } = await getAdmin();
  authWatching = true;
  authM.onAuthStateChanged(a, (u) => {
    const ok = !!u && typeof u.email === "string" && u.email.endsWith("@" + ADMIN_DOMAIN);
    adminUid = ok ? u.uid : null;
    if (!u) { try { localStorage.removeItem(LS_ADMIN); } catch { /* ignore */ } }
    if (state.admin !== ok) { state.admin = ok; renderAll(); }
  });
}

const loginMessage = (code) => {
  if (["auth/invalid-credential", "auth/wrong-password", "auth/user-not-found", "auth/invalid-email", "auth/invalid-login-credentials"].includes(code)) return "اسم المستخدم أو كلمة المرور غير صحيحة.";
  if (code === "auth/too-many-requests") return "محاولات كثيرة. انتظر قليلاً ثم حاول مرة أخرى.";
  if (code === "auth/network-request-failed") return "تعذّر الاتصال. تحقق من الإنترنت وحاول مرة أخرى.";
  if (code === "auth/operation-not-allowed") return "تسجيل الدخول بالبريد وكلمة المرور غير مفعّل في Firebase.";
  return "تعذّر تسجيل الدخول. حاول مرة أخرى.";
};

function openLogin() {
  openForm({
    heading: "دخول المدير",
    submitLabel: "دخول",
    fields: [
      { k: "u", l: "اسم المستخدم", t: "text", req: 1, max: 60, auto: "username" },
      { k: "p", l: "كلمة المرور", t: "password", req: 1, auto: "current-password" }
    ],
    onSubmit: async (v) => {
      const user = v.u.trim().toLowerCase();
      if (!/^[a-z0-9._-]{3,40}$/.test(user)) { const e = new Error("bad"); e.userMessage = loginMessage("auth/invalid-credential"); throw e; }
      try {
        const { authM, a } = await getAdmin();
        await authM.signInWithEmailAndPassword(a, `${user}@${ADMIN_DOMAIN}`, v.p);
      } catch (ex) { const e = new Error("login"); e.userMessage = loginMessage(ex && ex.code); throw e; }
      try { localStorage.setItem(LS_ADMIN, "1"); } catch { /* ignore */ }
      await watchAuth();
      toast("تم الدخول إلى وضع المدير");
    }
  });
}

function openAdminPanel() {
  const d = openDialog([]);
  const inner = d.firstChild;
  inner.replaceChildren(...[
    dlgHead("وضع المدير", d),
    h("p", { class: "sg-meta" }, "أنت مسجّل الدخول. استخدم أزرار «＋ إضافة» و«✎» و«🗑» على البطاقات لتعديل المحتوى."),
    adminUid ? h("p", { class: "sg-meta", dir: "ltr", style: "overflow-wrap:anywhere" }, "UID: " + adminUid) : null,
    h("div", { class: "sg-acts" },
      h("button", { type: "button", class: "primary-cta", onclick: () => { d.close(); openNewsManager(); } }, "إدارة الأخبار"),
      h("button", { type: "button", class: "secondary-cta", onclick: () => { d.close(); doLogout(); } }, "تسجيل الخروج"))].filter(Boolean));
}

async function doLogout() {
  try { const { authM, a } = await getAdmin(); await authM.signOut(a); } catch { /* ignore */ }
  state.admin = false; adminUid = null;
  try { localStorage.removeItem(LS_ADMIN); } catch { /* ignore */ }
  renderAll();
  toast("تم تسجيل الخروج");
}

const writeError = (ex) => {
  if (ex && ex.userMessage) return ex;
  const e = new Error("write");
  const denied = ex && String(ex.code || ex.message).toUpperCase().includes("PERMISSION");
  e.userMessage = denied
    ? (adminUid
      ? `لا تملك صلاحية الكتابة. تأكد أن قواعد Firebase منشورة وأن UID فيها يساوي: ${adminUid}`
      : "انتهت جلسة الدخول. سجّل الدخول من جديد.")
    : "تعذّر الحفظ. تحقق من الاتصال وحاول مرة أخرى.";
  return e;
};

async function wctx() {
  let c;
  try { c = await getAdmin(); } catch (ex) { throw writeError(ex); }
  if (!c.a.currentUser) throw writeError({ code: "PERMISSION" });
  return c;
}

async function saveItem(col, old, values) {
  const { dbM, d } = await wctx();
  const def = COLS[col];
  const obj = {};
  for (const f of def.fields) {
    if (f.t === "images" || f.t === "files") continue;
    let v = clean(values[f.k], f.k === "group" ? 60 : (f.max || 600));
    if (f.t === "url" && v) v = safeUrl(v);
    if (f.k === "subject" && v) { const c = classify(v); if (c.key.startsWith("k:")) v = c.label; }
    if (v) obj[f.k] = v;
  }
  const removed = [];
  try {
    const imgField = def.fields.find((f) => f.t === "images");
    if (imgField) {
      const v = values[imgField.k] || { keep: [], add: [] };
      const keep = (v.keep || []).filter((x) => IMG_ID.test(String(x))).slice(0, MAX_IMGS);
      const added = [];
      for (const u of (v.add || []).slice(0, MAX_IMGS - keep.length)) {
        if (typeof u !== "string" || !u.startsWith(IMG_PREFIX) || u.length > 380000) continue;
        const k = dbM.push(dbM.ref(d, "images")).key;
        await dbM.set(dbM.ref(d, "images/" + k), u);
        added.push(k);
      }
      const ids = [...keep, ...added].slice(0, MAX_IMGS);
      if (ids.length) obj.imgs = ids;
      for (const x of (old && Array.isArray(old.imgs) ? old.imgs : [])) if (!ids.includes(x)) removed.push(x);
    }
    const fileField = def.fields.find((f) => f.t === "files");
    const removedFiles = [];
    if (fileField) {
      const v = values[fileField.k] || { keep: [], add: [] };
      const keep = (v.keep || []).filter((x) => x && FILE_ID.test(String(x.id))).slice(0, MAX_FILES);
      const fids = keep.map((x) => x.id), fnames = keep.map((x) => clean(x.name, 80) || "ملف");
      for (const x of (v.add || []).slice(0, MAX_FILES - keep.length)) {
        if (!x || typeof x.data !== "string" || !x.data.startsWith("data:") || x.data.length > MAX_FILE_BYTES * 1.4) continue;
        const k = dbM.push(dbM.ref(d, "files")).key;
        await dbM.set(dbM.ref(d, "files/" + k), x.data);
        fids.push(k); fnames.push(clean(x.name, 80) || "ملف");
      }
      if (fids.length) { obj.files = fids; obj.fnames = fnames; }
      for (const x of (old && Array.isArray(old.files) ? old.files : [])) if (!fids.includes(x)) removedFiles.push(x);
    }
    obj.ts = (old && old.ts) || Date.now();
    obj.upd = Date.now();
    const key = old ? old.id : dbM.push(dbM.ref(d, `content/${col}`)).key;
    await dbM.set(dbM.ref(d, `content/${col}/${key}`), obj);
    for (const x of removed) { try { await dbM.remove(dbM.ref(d, "images/" + x)); } catch { /* ignore */ } }
    for (const x of removedFiles) { try { await dbM.remove(dbM.ref(d, "files/" + x)); } catch { /* ignore */ } }
  } catch (ex) { throw writeError(ex); }
}

function openItemForm(col, it) {
  const def = COLS[col];
  openForm({
    heading: (it ? "تعديل " : "إضافة ") + def.one,
    fields: def.fields,
    values: it || {},
    onSubmit: async (v) => {
      const multi = !it && def.fields.some((f) => f.grp) ? splitGroups(v.group) : [];
      if (multi.length > 1) {
        for (const g of multi) await saveItem(col, null, { ...v, group: g });
        rememberGroup(multi.join(" ؛ "));
        toast(`تمت الإضافة لـ ${multi.length} صفوف`);
        return;
      }
      await saveItem(col, it, multi.length === 1 ? { ...v, group: multi[0] } : v);
      if (!it) rememberGroup(multi[0] || "");
      toast(it ? "تم التعديل" : "تمت الإضافة");
    }
  });
}

async function deleteItem(col, it) {
  if (!window.confirm("هل تريد حذف هذا العنصر نهائياً؟")) return;
  try {
    const { dbM, d } = await wctx();
    await dbM.remove(dbM.ref(d, `content/${col}/${it.id}`));
    for (const x of Array.isArray(it.imgs) ? it.imgs : []) {
      if (IMG_ID.test(String(x))) { try { await dbM.remove(dbM.ref(d, "images/" + x)); } catch { /* ignore */ } }
    }
    for (const x of Array.isArray(it.files) ? it.files : []) {
      if (FILE_ID.test(String(x))) { try { await dbM.remove(dbM.ref(d, "files/" + x)); } catch { /* ignore */ } }
    }
    toast("تم الحذف");
  } catch (ex) { toast(writeError(ex).userMessage); }
}

function openGallery(ids) {
  const d = openDialog([]);
  const slots = ids.map(() => h("div", { class: "sg-gal" }, h("p", { class: "sg-meta" }, "جارٍ تحميل الصورة…")));
  d.firstChild.replaceChildren(dlgHead("صور الواجب", d), ...slots);
  ids.forEach((id, i) => {
    loadImage(id).then((u) => {
      slots[i].replaceChildren(
        h("img", { src: u, alt: `صورة الواجب ${i + 1}` }),
        h("a", { class: "secondary-cta", href: u, download: `homework-${i + 1}.jpg` }, "تحميل الصورة"));
    }).catch(() => slots[i].replaceChildren(h("p", { class: "sg-err" }, "تعذّر تحميل الصورة. تحقق من الاتصال.")));
  });
}

const DEFAULT_NEWS = [
  { text: "تنبيه: يرجى التأكد من تغيير كلمة المرور فور دخولك للحساب — صلّوا على النبي ﷺ", en: "Note: Change your password immediately after your first login." },
  { text: "تذكير: لا تشارك بيانات الدخول أو كلمة المرور مع أي شخص.", en: "Reminder: Do not share your login details or password with anyone." },
  { text: "تعلن وزارة التربية والتعليم العالي مواعيد العام الدراسي 2026/2027: بدء الدوام 5/9/2026، امتحانات الفصل الأول 28/12/2026–12/1/2027، عطلة نصف السنة 13/1/2027–31/1/2027، بدء الفصل الثاني 1/2/2027، امتحانات الفصل الثاني 2/6/2027–17/6/2027، وبداية العطلة الصيفية 18/6/2027.", en: "The Ministry of Education and Higher Education announces the 2026/2027 school calendar: classes begin 5 Sep 2026; first-semester exams 28 Dec 2026–12 Jan 2027; mid-year break 13–31 Jan 2027; the second semester begins 1 Feb 2027; second-semester exams 2–17 Jun 2027; and the summer break begins 18 Jun 2027." }
];

async function importDefaultNews() {
  const { dbM, d } = await wctx();
  const base = Date.now();
  try {
    for (let i = 0; i < DEFAULT_NEWS.length; i++) {
      const key = dbM.push(dbM.ref(d, "content/news")).key;
      await dbM.set(dbM.ref(d, `content/news/${key}`), { ...DEFAULT_NEWS[i], ts: base - i, upd: base });
    }
  } catch (ex) { throw writeError(ex); }
}

function openNewsManager() {
  const d = openDialog([]);
  const inner = d.firstChild;
  const draw = () => {
    const news = sorted("news");
    inner.replaceChildren(
      dlgHead("إدارة شريط الأخبار", d),
      h("div", { class: "sg-acts" },
        h("button", { type: "button", class: "primary-cta", onclick: () => openItemForm("news", null) }, "＋ إضافة خبر"),
        news.length ? null : h("button", { type: "button", class: "secondary-cta", onclick: async (e) => {
          e.target.disabled = true;
          try { await importDefaultNews(); toast("تم استيراد رسائل الشريط الحالية"); } catch (ex) { e.target.disabled = false; toast(ex.userMessage || "تعذّر الاستيراد"); }
        } }, "استيراد رسائل الشريط الحالية")),
      h("div", { class: "sg-mgr" }, news.length
        ? news.map((n) => h("div", { class: "sg-item" },
          h("div", { class: "sg-item-b" }, h("p", { class: "sg-txt", dir: "auto" }, n.text), n.link ? h("p", { class: "sg-meta", dir: "ltr" }, n.link) : null),
          h("div", { class: "sg-ctl" }, iconBtn("تعديل", "✎", () => openItemForm("news", n)), iconBtn("حذف", "🗑", () => deleteItem("news", n), "sg-del"))))
        : h("p", { class: "sg-empty" }, "لا توجد أخبار بعد. الشريط الحالي في الموقع سيبقى ظاهراً حتى تضيف خبراً أو تستورد رسائله.")));
  };
  draw();
  listeners.push(draw);
  d.addEventListener("close", () => { const i = listeners.indexOf(draw); if (i >= 0) listeners.splice(i, 1); });
}

function start() {
  const st = h("style", { id: "sg-admin-css" });
  st.textContent = CSS;
  document.head.append(st);

  applyFont(savedFont());
  loadCache();
  renderAll();

  // إعادة التركيب إذا أعاد التطبيق رسم الصفحة
  let raf = 0;
  new MutationObserver(() => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      syncTicker();
      mountDash();
      mountSched();
      readSearch();
      mountFontPicker();
    });
  }).observe(document.body, { childList: true, subtree: true });
  new MutationObserver(() => {
    renderAll();
    const g = document.getElementById("sg-font-group");
    if (g) { g.remove(); mountFontPicker(); }
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  // مزامنة «المنجز» بين تبويبات المتصفح المفتوحة
  window.addEventListener("storage", (e) => {
    if (e.key !== LS_DONE && e.key !== LS_HIDE_DONE) return;
    doneMap = readDone();
    hideFlag = (() => { try { return localStorage.getItem(LS_HIDE_DONE) === "1"; } catch { return hideFlag; } })();
    refreshLocal();
  });

  document.addEventListener("input", (e) => { if (e.target && e.target.closest && e.target.closest(".hero-search")) readSearch(); }, true);
  document.addEventListener("click", (e) => { if (e.target && e.target.closest && e.target.closest(".hero-search > button")) setTimeout(readSearch, 0); }, true);

  // الدخول: الضغط على اسم المصمم في التذييل (لا يوجد زر ظاهر)
  document.addEventListener("click", (e) => {
    const t = e.target;
    const hit = t && t.closest ? t.closest(".designer-credit b") : null;
    if (!hit) return;
    e.preventDefault();
    e.stopPropagation();
    if (state.admin) openAdminPanel(); else openLogin();
  }, true);

  initDb();
  let hint = false;
  try { hint = localStorage.getItem(LS_ADMIN) === "1"; } catch { /* ignore */ }
  if (hint) watchAuth().catch(() => {});
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
else start();


// ---- زر «تحديث الموقع» في التذييل (بجانب رقم الإصدار): يتحقق من وجود إصدار أحدث ويحدّث بدون تحديث قوي ----
const UPD_FILES = () => {
  const urls = ["./index.html", "./admin.js", "./sw.js"];
  document.querySelectorAll('script[src*="assets/"],link[rel="stylesheet"][href*="assets/"]').forEach((el) => {
    const u = el.getAttribute("src") || el.getAttribute("href");
    if (u && !u.startsWith("http")) urls.push(u);
  });
  return [...new Set(urls)];
};
async function buildSignature() {
  const parts = await Promise.all(UPD_FILES().map(async (u) => {
    const r = await fetch(u, { method: "HEAD", cache: "no-cache" });
    if (!r.ok) throw new Error("head-" + r.status);
    return u + "|" + (r.headers.get("etag") || r.headers.get("last-modified") || "") + "|" + (r.headers.get("content-length") || "");
  }));
  return parts.join("\n");
}
let loadedSig = null;
function rememberLoadedSig() { buildSignature().then((s) => { if (loadedSig === null) loadedSig = s; }).catch(() => {}); }
async function hardRefreshSite() {
  try {
    if ("serviceWorker" in navigator) for (const r of await navigator.serviceWorker.getRegistrations()) { try { await r.unregister(); } catch { /* ignore */ } }
    if (window.caches) for (const k of await caches.keys()) if (k.startsWith("studyguide-offline-")) { try { await caches.delete(k); } catch { /* ignore */ } }
  } catch { /* ignore */ }
  location.reload();
}
async function onUpdateClick(btn) {
  const en = lang() === "en";
  if (btn.getAttribute("aria-busy") === "true") return;
  if (!navigator.onLine) { toast(en ? "No internet connection" : "لا يوجد اتصال بالإنترنت"); return; }
  btn.setAttribute("aria-busy", "true");
  const label = btn.querySelector("span");
  const old = label.textContent;
  label.textContent = en ? "Checking…" : "جاري التحقق…";
  try {
    const now = await buildSignature();
    if (loadedSig !== null && now === loadedSig) {
      toast(en ? "You're on the latest version ✓" : "أنت على آخر إصدار ✓");
      label.textContent = old; btn.removeAttribute("aria-busy");
      return;
    }
    label.textContent = en ? "Updating…" : "جاري التحديث…";
    toast(en ? "New version found — updating…" : "تم العثور على إصدار جديد — جاري التحديث…");
    await hardRefreshSite();
  } catch {
    toast(en ? "Couldn't check for updates. Try again." : "تعذّر التحقق من التحديثات. حاول مرة أخرى.");
    label.textContent = old; btn.removeAttribute("aria-busy");
  }
}
function mountUpdateBtn() {
  const meta = document.querySelector(".footer-meta");
  if (!meta || meta.querySelector("#sg-update-btn")) return;
  const en = lang() === "en";
  const btn = h("button", { type: "button", id: "sg-update-btn", class: "footer-update", "aria-label": en ? "Check for updates" : "تحديث الموقع لآخر إصدار", title: en ? "Update to the latest version" : "تحديث الموقع لآخر إصدار", onclick: (e) => onUpdateClick(e.currentTarget) },
    h("span", {}, en ? "Update" : "تحديث"));
  btn.prepend(svgIconSafe());
  const ver = [...meta.children].find((c) => /^V\.\d/.test(c.textContent || ""));
  if (ver) ver.after(btn); else meta.append(btn);
}
function svgIconSafe() {
  const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  s.setAttribute("width", "14"); s.setAttribute("height", "14"); s.setAttribute("viewBox", "0 0 24 24");
  s.setAttribute("fill", "none"); s.setAttribute("stroke", "currentColor"); s.setAttribute("stroke-width", "2.2");
  s.setAttribute("stroke-linecap", "round"); s.setAttribute("stroke-linejoin", "round"); s.setAttribute("aria-hidden", "true");
  s.innerHTML = '<path d="M21 12a9 9 0 1 1-3-6.7"/><polyline points="21 3 21 9 15 9"/>';
  return s;
}
{
  let t = 0;
  const kick = () => { clearTimeout(t); t = setTimeout(mountUpdateBtn, 120); };
  new MutationObserver(kick).observe(document.body, { childList: true, subtree: true });
  kick();
  setTimeout(rememberLoadedSig, 2500);
}


// ---- شارة «موقع موثوق» بجانب اسم الموقع (معتمد من مديرة المدرسة) ----
function verifiedBadge() {
  const en = lang() === "en";
  const txt = en ? "Verified site — approved by the school principal" : "موقع موثوق ✓ معتمد من مديرة المدرسة";
  const el = h("span", { class: "sg-verified", role: "button", tabindex: "0", "aria-label": txt, title: txt });
  el.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.00 0.25 L12.51 0.33 L13.00 0.56 L13.46 0.92 L13.88 1.36 L14.25 1.85 L14.59 2.32 L14.92 2.73 L15.26 3.05 L15.62 3.27 L16.02 3.37 L16.49 3.38 L17.01 3.32 L17.59 3.23 L18.19 3.15 L18.80 3.13 L19.38 3.21 L19.89 3.39 L20.31 3.69 L20.61 4.11 L20.79 4.62 L20.87 5.20 L20.85 5.81 L20.77 6.41 L20.68 6.99 L20.62 7.51 L20.63 7.98 L20.73 8.38 L20.95 8.74 L21.27 9.08 L21.68 9.41 L22.15 9.75 L22.64 10.12 L23.08 10.54 L23.44 11.00 L23.67 11.49 L23.75 12.00 L23.67 12.51 L23.44 13.00 L23.08 13.46 L22.64 13.88 L22.15 14.25 L21.68 14.59 L21.27 14.92 L20.95 15.26 L20.73 15.62 L20.63 16.02 L20.62 16.49 L20.68 17.01 L20.77 17.59 L20.85 18.19 L20.87 18.80 L20.79 19.38 L20.61 19.89 L20.31 20.31 L19.89 20.61 L19.38 20.79 L18.80 20.87 L18.19 20.85 L17.59 20.77 L17.01 20.68 L16.49 20.62 L16.02 20.63 L15.62 20.73 L15.26 20.95 L14.92 21.27 L14.59 21.68 L14.25 22.15 L13.88 22.64 L13.46 23.08 L13.00 23.44 L12.51 23.67 L12.00 23.75 L11.49 23.67 L11.00 23.44 L10.54 23.08 L10.12 22.64 L9.75 22.15 L9.41 21.68 L9.08 21.27 L8.74 20.95 L8.38 20.73 L7.98 20.63 L7.51 20.62 L6.99 20.68 L6.41 20.77 L5.81 20.85 L5.20 20.87 L4.62 20.79 L4.11 20.61 L3.69 20.31 L3.39 19.89 L3.21 19.38 L3.13 18.80 L3.15 18.19 L3.23 17.59 L3.32 17.01 L3.38 16.49 L3.37 16.02 L3.27 15.62 L3.05 15.26 L2.73 14.92 L2.32 14.59 L1.85 14.25 L1.36 13.88 L0.92 13.46 L0.56 13.00 L0.33 12.51 L0.25 12.00 L0.33 11.49 L0.56 11.00 L0.92 10.54 L1.36 10.12 L1.85 9.75 L2.32 9.41 L2.73 9.08 L3.05 8.74 L3.27 8.38 L3.37 7.98 L3.38 7.51 L3.32 6.99 L3.23 6.41 L3.15 5.81 L3.13 5.20 L3.21 4.62 L3.39 4.11 L3.69 3.69 L4.11 3.39 L4.62 3.21 L5.20 3.13 L5.81 3.15 L6.41 3.23 L6.99 3.32 L7.51 3.38 L7.98 3.37 L8.38 3.27 L8.74 3.05 L9.08 2.73 L9.41 2.32 L9.75 1.85 L10.12 1.36 L10.54 0.92 L11.00 0.56 L11.49 0.33Z" fill="#1d7fe0"/><path d="M7.6 12.4l3 3 5.8-6.4" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const say = (e) => { e.preventDefault(); e.stopPropagation(); toast(txt); };
  el.addEventListener("click", say);
  el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") say(e); });
  return el;
}
function mountVerified() {
  document.querySelectorAll(".brand b, .footer-brand b").forEach((b) => {
    const cur = b.querySelector(".sg-verified");
    if (cur && b.firstElementChild === cur) return;
    if (cur) cur.remove();
    b.prepend(verifiedBadge()); // قبل حرف S مباشرة
  });
}
{
  let t2 = 0;
  const kick2 = () => { clearTimeout(t2); t2 = setTimeout(mountVerified, 120); };
  new MutationObserver(kick2).observe(document.body, { childList: true, subtree: true });
  kick2();
}


// ---- «الوضع الجديد» (زجاج سائل): زر داخل نافذة «تخصيص»، يحفظ اختياره في المتصفح ----
const GLASS_KEY = "sg-glass";
const glassIsOn = () => { try { return localStorage.getItem(GLASS_KEY) === "on"; } catch { return false; } };
// عند تفعيل «الوضع الجديد» من الزر: الخط يصبح Amiri والثيم أزرق سماوي تلقائياً (يمكن للمستخدم تغييرهما بعدها)
function applyNewModeDefaults() {
  // الخط: نفس آلية الحفظ والتطبيق المستخدمة في قائمة الخطوط
  try { localStorage.setItem(LS_FONT, "Amiri"); } catch {}
  applyFont("Amiri");
  const fg = document.getElementById("sg-font-group");
  if (fg) { fg.remove(); mountFontPicker(); }
  // الثيم: نضغط زر «أزرق سماوي» ليتحدّث React وتُحفظ القيمة (sg-theme) كأي اختيار عادي
  const chip = [...document.querySelectorAll(".settings-modal .theme-chip")]
    .find((c) => /أزرق سماوي|Sky blue/i.test(c.textContent || ""));
  if (chip) { if (!chip.classList.contains("active")) chip.click(); return; }
  try { localStorage.setItem("sg-theme", "sky"); } catch {}
  document.documentElement.dataset.theme = "sky";
}
function setGlass(on) {
  if (on) document.documentElement.dataset.glass = "on"; else delete document.documentElement.dataset.glass;
  try { localStorage.setItem(GLASS_KEY, on ? "on" : "off"); } catch {}
  if (on) applyNewModeDefaults();
}
if (glassIsOn()) document.documentElement.dataset.glass = "on";
function mountGlassBtn() {
  const modal = document.querySelector(".settings-modal");
  if (!modal) return;
  const en = lang() === "en";
  const on = glassIsOn();
  let grp = modal.querySelector("#sg-glass-group");
  if (!grp) {
    grp = h("div", { class: "settings-group", id: "sg-glass-group" },
      h("div", { class: "setting-label" }, h("span", { id: "sg-glass-title" })),
      h("button", { type: "button", class: "sg-glass-btn", id: "sg-glass-btn", onclick: () => { setGlass(!glassIsOn()); mountGlassBtn(); } }),
      h("p", { class: "sg-glass-note", id: "sg-glass-note" }));
    const head = modal.querySelector("header");
    if (head) head.after(grp); else modal.prepend(grp);
  }
  const btn = grp.querySelector("#sg-glass-btn");
  grp.querySelector("#sg-glass-title").textContent = en ? "Look & feel" : "مظهر الموقع";
  btn.textContent = (on ? "✓ " : "") + (en ? "New mode" : "الوضع الجديد");
  btn.classList.toggle("active", on);
  btn.setAttribute("aria-pressed", on ? "true" : "false");
  grp.querySelector("#sg-glass-note").textContent = en
    ? "Soft colourful background with glass buttons. Press again to go back to the classic look."
    : "خلفية ألوان ناعمة وأزرار زجاجية. اضغط مرة ثانية للرجوع للوضع الأصلي.";
}
{
  let tg = 0;
  const kickG = () => { clearTimeout(tg); tg = setTimeout(mountGlassBtn, 60); };
  new MutationObserver(kickG).observe(document.body, { childList: true, subtree: true });
  kickG();
}
