const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

function loadNormalizer() {
  const src = fs.readFileSync(path.join(__dirname, '..', 'data', 'hadith-normalize.js'), 'utf8');
  const window = {};
  new Function('window', src)(window);
  return window.HadithNormalize.normalizeRemoteEdition;
}

const ENG = {
  metadata: { name: 'Sunan Test', sections: { '1': 'Purification', '2': 'Prayer' } },
  hadiths: [
    { hadithnumber: 1, arabicnumber: 1, text: 'English one', grades: [], reference: { book: 1, hadith: 1 } },
    { hadithnumber: 2, arabicnumber: 2, text: 'English two', grades: [], reference: { book: 1, hadith: 2 } },
    { hadithnumber: 5, arabicnumber: 5, text: 'Unmatched english', grades: [], reference: { book: 2, hadith: 5 } }
  ]
};
const ARA = {
  metadata: { name: 'Sunan Test AR', sections: { '1': 'x', '2': 'y' } },
  hadiths: [
    { hadithnumber: 1, arabicnumber: 1, text: 'Ø¹Ø±Ø¨ÙŠ ÙˆØ§Ø­Ø¯<br>extra', grades: [], reference: { book: 1, hadith: 1 } },
    { hadithnumber: 2, arabicnumber: 2, text: 'Ø¹Ø±Ø¨ÙŠ Ø§Ø«Ù†Ø§Ù†', grades: [], reference: { book: 1, hadith: 2 } },
    { hadithnumber: 9, arabicnumber: 9, text: 'Ø¹Ø±Ø¨ÙŠ Ø¨Ù„Ø§ Ù…Ù‚Ø§Ø¨Ù„', grades: [], reference: { book: 2, hadith: 9 } }
  ]
};

test('normalize: groups by reference.book with section names, sorted', () => {
  const norm = loadNormalizer();
  const col = norm(ENG, ARA, { id: 'test', name: 'Sunan Test', desc: 'd' });
  assert.equal(col.books.length, 2);
  assert.deepEqual(col.books.map(b => b.id), [1, 2]);
  assert.equal(col.books[0].name, 'Purification');
  assert.equal(col.books[1].name, 'Prayer');
});

test('normalize: joins arabic by book:hadith, strips <br>, null when unmatched', () => {
  const norm = loadNormalizer();
  const col = norm(ENG, ARA, { id: 'test', name: 'Sunan Test' });
  const b1 = col.books[0].hadiths;
  assert.equal(b1[0].a, 'Ø¹Ø±Ø¨ÙŠ ÙˆØ§Ø­Ø¯ extra');
  assert.equal(b1[1].a, 'Ø¹Ø±Ø¨ÙŠ Ø§Ø«Ù†Ø§Ù†');
  assert.equal(col.books[1].hadiths[0].a, null); // eng 2:5 has no arabic match
  assert.equal(col.books[1].hadiths[0].t, 'Unmatched english');
  assert.deepEqual(b1[0], { n: 1, t: 'English one', a: 'Ø¹Ø±Ø¨ÙŠ ÙˆØ§Ø­Ø¯ extra', b: 1, h: 1 });
});

test('normalize: survives missing ara edition and empty sections', () => {
  const norm = loadNormalizer();
  const col = norm(ENG, null, { id: 'test', name: 'Sunan Test' });
  assert.equal(col.books.length, 2);
  assert.equal(col.books[0].hadiths[0].a, null);
  const col2 = norm({ metadata: {}, hadiths: [{ hadithnumber: 3, text: 'x', reference: { book: 4, hadith: 3 } }] }, null, { id: 'z', name: 'Z' });
  assert.equal(col2.books[0].name, 'Book 4');
});
