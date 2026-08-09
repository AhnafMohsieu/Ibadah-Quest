'use strict';
const fs = require('fs');
const vm = require('vm');

function loadFile(filePath, overrides) {
  const code = fs.readFileSync(filePath, 'utf8');
  const sandbox = {
    window: {},
    console,
    localStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {}
    },
    iqIcon: () => ''
  };
  Object.assign(sandbox, overrides || {});
  vm.runInNewContext(code, sandbox, { filename: filePath });
  return sandbox;
}

module.exports = { loadFile };
