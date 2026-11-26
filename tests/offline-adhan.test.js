'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');

function loadPrayerEngine(stateOverrides) {
  const S = Object.assign({
    hijriOffset: 0,
    prayerSettings: { lat: 23.8103, lng: 90.4125, label: 'Dhaka', method: 1, asrSchool: 'hanafi', highLat: 'middle', offsets: {}, paused: false }
  }, stateOverrides || {});
  const sandbox = {
    window: {},
    console,
    Math, Date, Number, String, Boolean, Array, Object, JSON, RegExp, Error,
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    S,
    escapeHTML: (v) => String(v == null ? '' : v)
  };
  sandbox.global = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.self = sandbox;
  for (const rel of ['assets/vendor/adhan.umd.min.js', 'core/calendar.js', 'core/render-prayers.js']) {
    const code = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    vm.runInNewContext(code, sandbox, { filename: rel });
    for (const k of Object.keys(sandbox.window)) sandbox[k] = sandbox.window[k];
  }
  return { sandbox, S };
}

test('offline adhan engine computes valid chronological prayer times for 7 global benchmark cities', () => {
  const cities = [
    { label: 'Dhaka', lat: 23.8103, lng: 90.4125, method: 1, asrSchool: 'hanafi' },
    { label: 'Chattogram', lat: 22.3569, lng: 91.7832, method: 1, asrSchool: 'hanafi' },
    { label: 'Makkah', lat: 21.4225, lng: 39.8262, method: 4, asrSchool: 'shafi' },
    { label: 'Cairo', lat: 30.0444, lng: 31.2357, method: 5, asrSchool: 'shafi' },
    { label: 'London', lat: 51.5072, lng: -0.1276, method: 15, asrSchool: 'shafi' },
    { label: 'New York', lat: 40.7128, lng: -74.0060, method: 2, asrSchool: 'shafi' },
    { label: 'Tromso', lat: 69.6492, lng: 18.9553, method: 3, asrSchool: 'shafi', highLat: 'twilight' }
  ];
  const equinoctialDate = new Date(2026, 2, 21, 12, 0, 0);
  const toMin = (t) => t.h * 60 + t.m;
  for (const city of cities) {
    const { sandbox } = loadPrayerEngine({ prayerSettings: Object.assign({ offsets: {} }, city) });
    const times = sandbox.computeOfflinePrayerTimes(city, equinoctialDate);
    assert.ok(times && times.Fajr && times.Isha, city.label + ' must compute times without network');
    assert.ok(toMin(times.Fajr) < toMin(times.Sunrise), city.label + ' Fajr < Sunrise');
    assert.ok(toMin(times.Sunrise) < toMin(times.Dhuhr), city.label + ' Sunrise < Dhuhr');
    assert.ok(toMin(times.Dhuhr) < toMin(times.Asr), city.label + ' Dhuhr < Asr');
    assert.ok(toMin(times.Asr) < toMin(times.Maghrib), city.label + ' Asr < Maghrib');
    assert.ok(toMin(times.Maghrib) < toMin(times.Isha), city.label + ' Maghrib < Isha');
  }
});

test('Hanafi Asr is noticeably later than Shafi Asr in Dhaka', () => {
  const date = new Date(2026, 5, 21, 12, 0, 0);
  const { sandbox } = loadPrayerEngine();
  const hanafi = sandbox.computeOfflinePrayerTimes({ lat: 23.8103, lng: 90.4125, method: 1, asrSchool: 'hanafi' }, date);
  const shafi = sandbox.computeOfflinePrayerTimes({ lat: 23.8103, lng: 90.4125, method: 1, asrSchool: 'shafi' }, date);
  const diff = (hanafi.Asr.h * 60 + hanafi.Asr.m) - (shafi.Asr.h * 60 + shafi.Asr.m);
  assert.ok(diff >= 40 && diff <= 90, 'Expected Hanafi Asr ~40-90 mins after Shafi, got ' + diff);
});

test('High-latitude summer solstice computes valid non-NaN times with HighLat fallback', () => {
  const summerDate = new Date(2026, 5, 21, 12, 0, 0);
  const { sandbox } = loadPrayerEngine();
  const times = sandbox.computeOfflinePrayerTimes({ lat: 69.6492, lng: 18.9553, method: 3, asrSchool: 'shafi', highLat: 'seventh' }, summerDate);
  for (const k of ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']) {
    assert.ok(Number.isInteger(times[k].h) && Number.isInteger(times[k].m), k + ' must be finite integers at 69N');
  }
});

test('Qibla bearing returns expected spherical trigonometry azimuths', () => {
  const { sandbox } = loadPrayerEngine();
  const dhakaQ = sandbox.computeQiblaBearing(23.8103, 90.4125);
  const londonQ = sandbox.computeQiblaBearing(51.5072, -0.1276);
  const nycQ = sandbox.computeQiblaBearing(40.7128, -74.0060);
  assert.ok(dhakaQ > 270 && dhakaQ < 285, 'Dhaka Qibla WNW ~277.6deg, got ' + dhakaQ);
  assert.ok(londonQ > 110 && londonQ < 126, 'London Qibla SE ~119deg, got ' + londonQ);
  assert.ok(nycQ > 50 && nycQ < 66, 'NYC Qibla ENE ~58.5deg, got ' + nycQ);
});

test('Hijri calendar offset adjusts sighting cleanly from -2 to +2 across dates', () => {
  const d = new Date(2026, 2, 20, 12, 0, 0);
  const baseEnv = loadPrayerEngine({ hijriOffset: 0 });
  const plusEnv = loadPrayerEngine({ hijriOffset: 2 });
  const minusEnv = loadPrayerEngine({ hijriOffset: -2 });
  const h0 = baseEnv.sandbox.getAdjustedHijri(d);
  const hp = plusEnv.sandbox.getAdjustedHijri(d);
  const hm = minusEnv.sandbox.getAdjustedHijri(d);
  assert.ok(hp.day !== h0.day || hp.month !== h0.month, '+2 offset shifts Hijri date');
  assert.ok(hm.day !== h0.day || hm.month !== h0.month, '-2 offset shifts Hijri date');
});
