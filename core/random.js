(function() {
  function weightedPick(pool) {
    var total = 0;
    for (var i = 0; i < pool.length; i++) total += pool[i].weight;
    var roll = Math.random() * total;
    var chosen = pool[0];
    for (var j = 0; j < pool.length; j++) {
      roll -= pool[j].weight;
      if (roll <= 0) { chosen = pool[j]; break; }
    }
    return chosen;
  }
  window.weightedPick = weightedPick;
})();
