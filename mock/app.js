/* Kick It — shared prototype behavior */
(function () {
  var S = function (inner) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + inner + '</svg>';
  };
  var IC = {
    home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
    compass: '<path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"/><circle cx="12" cy="12" r="10"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    pin: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'
  };

  function buildNav() {
    var bar = document.querySelector('.tabbar');
    if (!bar) return;
    var active = document.body.dataset.tab || '';
    bar.innerHTML =
      '<a class="tab ' + (active === 'feed' ? 'active' : '') + '" href="feed.html">' + S(IC.home) + '</a>' +
      '<a class="tab ' + (active === 'explore' ? 'active' : '') + '" href="explore.html">' + S(IC.compass) + '</a>' +
      '<a class="tab add" href="add.html"><span class="plus">' + S(IC.plus) + '</span></a>' +
      '<a class="tab ' + (active === 'spots' ? 'active' : '') + '" href="spots.html">' + S(IC.pin) + '</a>' +
      '<a class="tab ' + (active === 'profile' ? 'active' : '') + '" href="profile.html">' + S(IC.user) + '</a>';
  }

  // color score bubbles by value: 0 = red, 5 = yellow, 10 = green
  function colorScores() {
    document.querySelectorAll('.score[data-score]').forEach(function (el) {
      var s = parseFloat(el.dataset.score);
      if (isNaN(s)) return;
      var hue = Math.max(0, Math.min(120, s * 12));
      el.style.background = 'hsl(' + hue + ' 70% 44%)';
    });
  }

  document.addEventListener('click', function (e) {
    // tap a ranking row to expand details (ignore taps on links/buttons inside)
    var row = e.target.closest('.row');
    if (row && !e.target.closest('a,button,.viewlink')) { row.classList.toggle('open'); return; }

    // add-flow: toggle a selectable badge
    var sel = e.target.closest('.badge.selectable');
    if (sel) { sel.classList.toggle('on'); return; }

    // spot detail: endorse a vouch badge (+/- the count)
    var end = e.target.closest('.badge.endorsable');
    if (end) {
      var ct = end.querySelector('.ct');
      var on = end.classList.toggle('endorsed');
      if (ct) ct.textContent = (parseInt(ct.textContent, 10) || 0) + (on ? 1 : -1);
      return;
    }
  });

  // sort ranking lists by score (desc), open the top row, renumber ranks
  function scoreOf(row) { var s = row.querySelector('.score'); return s ? (parseFloat(s.dataset.score) || 0) : 0; }
  function sortRanks() {
    document.querySelectorAll('.ranklist').forEach(function (list) {
      var rows = Array.prototype.filter.call(list.children, function (c) {
        return c.classList && c.classList.contains('row');
      });
      rows.sort(function (a, b) { return scoreOf(b) - scoreOf(a); });
      var rank = 1;
      rows.forEach(function (r, i) {
        r.classList.toggle('open', i === 0);
        var n = r.querySelector('.row-rank');
        if (n) n.textContent = rank;
        rank++;
        list.appendChild(r);
      });
    });
  }

  buildNav();
  sortRanks();
  colorScores();
})();
