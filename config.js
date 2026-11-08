// ============================================================
//  Yanbu Area 2026 Safety Campaign — Registration settings
//  عدّل هذا الملف فقط بعد إنشاء مشروع Firebase (انظر SETUP.md)
// ============================================================

window.APP_CONFIG = {
  // 1) ألصق هنا إعدادات Firebase (Project settings → Your apps → Web app)
  //    إذا تركتها فاضية، الموقع يشتغل في "وضع التجربة" على جهازك فقط.
  firebase: {
    apiKey: "AIzaSyBlQf7Rys74pp4_pkQVJUH3X0bjfpXN6og",
    authDomain: "ynglfd-safety.firebaseapp.com",
    databaseURL: "https://ynglfd-safety-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "ynglfd-safety",
    appId: "1:64054902778:web:c3b0fd5dcfaa8c1de62e43"
  },

  // 2) إعدادات الفعالية
  capacityPerDay: 100,          // لازم يطابق الرقم في database.rules.json
  organizer: "Yanbu NGL Fractionation Department",
  coOrganizer: "Western Region Area Loss Prevention",
  location: "Sariya Hotel, Yanbu",
  time: { en: "7:30 a.m. – 1:00 p.m.", ar: "٧:٣٠ ص – ١:٠٠ م" },

  days: [
    { id: "d17", date: "2026-11-17", closesAt: "2026-11-17T13:00:00+03:00" },
    { id: "d18", date: "2026-11-18", closesAt: "2026-11-18T13:00:00+03:00" }
  ],

  // اقتراحات تظهر في خانة الشركة (يقدر المسجل يكتب غيرها)
  companies: ["Saudi Aramco", "SAMREF", "YASREF", "Luberef", "YANSAB", "Contractor"]
};
