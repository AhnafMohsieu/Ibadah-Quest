const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

// Check all script files exist
const scripts = html.match(/src="([^"]+)"/g) || [];
const missing = [];
scripts.forEach(s => {
  const path = s.replace(/src="|"/g, '');
  if (path.startsWith('data/') || path.startsWith('features/') || path.startsWith('analytics/') || path.startsWith('core/') || path.startsWith('render/') || path.startsWith('state/')) {
    if (!fs.existsSync(path)) missing.push(path);
  }
});
if (missing.length) console.log('MISSING SCRIPTS:', missing.join(', '));
else console.log('OK: All script files exist');

// Check panels have tabs
const panels = html.match(/id="panel-([^"]+)"/g) || [];
const tabGroups = fs.readFileSync('data/tab-groups.js', 'utf8');
const tabIds = tabGroups.match(/id:\s*'([^']+)'/g) || [];
const tabSet = new Set(tabIds.map(t => t.replace(/id:\s*'|'/g, '')));
const missingPanels = [];
panels.forEach(p => {
  const id = p.replace(/id="panel-|"/g, '');
  if (!tabSet.has(id)) missingPanels.push(id);
});
if (missingPanels.length) console.log('PANELS WITHOUT TABS:', missingPanels.join(', '));
else console.log('OK: All panels have matching tabs');

// Check for duplicate panels
const panelIds = panels.map(p => p.replace(/id="panel-|"/g, ''));
const dupes = panelIds.filter((id, i) => panelIds.indexOf(id) !== i);
if (dupes.length) console.log('DUPLICATE PANELS:', [...new Set(dupes)].join(', '));
else console.log('OK: No duplicate panels');

// Check renderStatic has mood
if (tabGroups.includes("'mood'")) console.log('OK: Mood tab in tab-groups');
else console.log('MISSING: Mood tab not in tab-groups');

// Check features loaded
const features = ['health.js', 'finance.js', 'mood.js'];
features.forEach(f => {
  if (html.includes(f)) console.log('OK: ' + f + ' loaded');
  else console.log('MISSING: ' + f + ' not loaded in HTML');
});

// Check pools loaded
const pools = ['health.js', 'finance.js', 'mood.js'];
pools.forEach(f => {
  const path = 'data/pools/' + f;
  if (fs.existsSync(path)) console.log('OK: ' + path + ' exists');
  else console.log('MISSING: ' + path);
  if (html.includes(path)) console.log('  -> loaded in HTML');
  else console.log('  -> NOT loaded in HTML');
});
