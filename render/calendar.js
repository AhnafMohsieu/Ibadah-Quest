(function() {
  // -------------------------------------------------------
  // HIJRI CALENDAR CONVERSION
  // -------------------------------------------------------

  const HIJRI_MONTHS = ['Muharram','Safar','Rabi al-Awwal','Rabi al-Thani','Jumada al-Ula','Jumada al-Thani','Rajab','Sha\'ban','Ramadan','Shawwal','Dhul Qi\'dah','Dhul Hijjah'];
  const HIJRI_MONTHS_AR = ['المحرم','صفر','ربيع الأول','ربيع الثاني','جمادى الأولى','جمادى الآخرة','رجب','شعبان','رمضان','شوال','ذو القعدة','ذو الحجة'];
  const WEEKDAYS_EN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const WEEKDAYS_AR = ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
  const WEEKDAYS_ROM = ['Ahad','Ithnayn','Thulatha','Arbi\'a','Khamis','Jumu\'ah','Sabt'];

  function gregorianToHijri(gY, gM, gD) {
    const jd = Math.floor((1461 * (gY + 4800 + Math.floor((gM - 14) / 12))) / 4) +
               Math.floor((367 * (gM - 2 - 12 * Math.floor((gM - 14) / 12))) / 12) -
               Math.floor((3 * Math.floor((gY + 4900 + Math.floor((gM - 14) / 12)) / 100)) / 4) +
               gD - 32075;
    const l = jd - 1948440 + 10632;
    const n = Math.floor((l - 1) / 10631);
    const remainder = l - 10631 * n + 354;
    const j = Math.floor((10985 - remainder) / 5316) * Math.floor((50 * remainder) / 17719) +
              Math.floor(remainder / 5670) * Math.floor((43 * remainder) / 15238);
    const remainderJ = remainder - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
                       Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
    const hM = Math.floor((24 * remainderJ) / 709);
    const hD = remainderJ - Math.floor((709 * hM) / 24);
    const hY = 30 * n + j - 30;
    return { year: hY, month: hM, day: hD };
  }

  function hijriToGregorian(hY, hM, hD) {
    const jd = Math.floor((11 * hY + 3) / 30) + 354 * hY + 30 * hM -
               Math.floor((hM - 1) / 2) + hD + 1948440 - 385;
    const l = jd + 68569;
    const n = Math.floor((4 * l) / 146097);
    const remainder = l - Math.floor((146097 * n + 3) / 4);
    const i = Math.floor((4000 * (remainder + 1)) / 1461001);
    const remainderI = remainder - Math.floor((1461 * i) / 4) + 31;
    const j = Math.floor((80 * remainderI) / 2447);
    const gD = remainderI - Math.floor((2447 * j) / 80);
    const remainderJ2 = Math.floor(j / 11);
    const gM = j + 2 - 12 * remainderJ2;
    const gY = 100 * (n - 49) + i + remainderJ2;
    return { year: gY, month: gM, day: gD };
  }

  function getDaysInHijriMonth(hY, hM) {
    if (hM % 2 === 1 || (hM === 12 && isHijriLeapYear(hY))) return 30;
    return 29;
  }

  function isHijriLeapYear(hY) {
    return ((11 * hY + 14) % 30) < 11;
  }

  function getHijriMonthDays(hY, hM) {
    let total = 0;
    for (let m = 1; m < hM; m++) total += getDaysInHijriMonth(hY, m);
    return total;
  }

  let calViewYear, calViewMonth, calViewHijriY, calViewHijriM;

  function initCalView() {
    const now = new Date();
    calViewYear = now.getFullYear();
    calViewMonth = now.getMonth();
    const h = gregorianToHijri(calViewYear, calViewMonth + 1, 1);
    calViewHijriY = h.year;
    calViewHijriM = h.month;
  }

  function calPrevMonth() {
    calViewMonth--;
    if (calViewMonth < 0) { calViewMonth = 11; calViewYear--; }
    const h = gregorianToHijri(calViewYear, calViewMonth + 1, 1);
    calViewHijriY = h.year;
    calViewHijriM = h.month;
    renderProg();
  }

  function calNextMonth() {
    calViewMonth++;
    if (calViewMonth > 11) { calViewMonth = 0; calViewYear++; }
    const h = gregorianToHijri(calViewYear, calViewMonth + 1, 1);
    calViewHijriY = h.year;
    calViewHijriM = h.month;
    renderProg();
  }

  function calGoToday() {
    const now = new Date();
    calViewYear = now.getFullYear();
    calViewMonth = now.getMonth();
    const h = gregorianToHijri(calViewYear, calViewMonth + 1, 1);
    calViewHijriY = h.year;
    calViewHijriM = h.month;
    renderProg();
  }

  Object.defineProperty(window, 'calViewYear', { get: function() { return calViewYear; }, set: function(v) { calViewYear = v; }, configurable: true });
  Object.defineProperty(window, 'calViewMonth', { get: function() { return calViewMonth; }, set: function(v) { calViewMonth = v; }, configurable: true });
  Object.defineProperty(window, 'calViewHijriY', { get: function() { return calViewHijriY; }, set: function(v) { calViewHijriY = v; }, configurable: true });
  Object.defineProperty(window, 'calViewHijriM', { get: function() { return calViewHijriM; }, set: function(v) { calViewHijriM = v; }, configurable: true });

  window.HIJRI_MONTHS = HIJRI_MONTHS;
  window.HIJRI_MONTHS_AR = HIJRI_MONTHS_AR;
  window.WEEKDAYS_EN = WEEKDAYS_EN;
  window.WEEKDAYS_AR = WEEKDAYS_AR;
  window.WEEKDAYS_ROM = WEEKDAYS_ROM;
  window.gregorianToHijri = gregorianToHijri;
  window.hijriToGregorian = hijriToGregorian;
  window.initCalView = initCalView;
  window.calPrevMonth = calPrevMonth;
  window.calNextMonth = calNextMonth;
  window.calGoToday = calGoToday;
})();
