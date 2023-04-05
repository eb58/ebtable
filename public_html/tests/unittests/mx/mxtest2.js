/* global QUnit */

const tblData = [
  ['  ', 1, -1, 'Wolperdinger', '31.08.1915', 'Herder, Johann Gottfried', 5],
  ['  ', 1, -1, 'Yeti        ', '31.08.2016', 'Lichtenberg, Georg Christoph ', 31],
  ['GA', 5, 10, 'Säugetiere  ', '', '', 0],
  ['GB', 1, 10, 'Esel        ', '05.08.2011', 'Liebig, Ellen,', 1],
  ['GB', 1, 10, 'Affe        ', '10.06.2013', 'Heine, Heinrich', 2],
  ['GA', 4, 20, 'Insekten    ', '', '', 0],
  ['GB', 1, 20, 'Fliege      ', '31.08.2009', 'Mann, Thomas', 0],
  ['GB', 1, 20, 'Biene       ', '31.08.2001', 'Lessing, Gottfried', 7],
  ['GA', 2, 30, 'Fische      ', '', '', 0],
  ['GB', 1, 30, 'Karpfen     ', '31.08.2009', 'Mann, Thomas', 0],
  ['GB', 1, 30, 'Forelle     ', '31.08.2001', 'Lessing, Gottfried', 7],
  ['  ', 1, -1, 'Einhorn     ', '04.11.2017', 'Goethe, Johann Wolfgang', 63]
];
tblData.forEach(function(row) {
  row.splice(3, 0, 'XXX');
});


QUnit.test('testset: grouping functions', function(assert) {
  const m = mx(tblData.slice());

  const groupingCols = {
    grouplabel: 0,
    groupcnt: 1,
    groupid: 2,
    groupsortstring: 3,
    groupname: 4,
    grouphead: 'GA',
    groupelem: 'GB'
  };
  m.initGroups(groupingCols);
  assert.deepEqual(m.groupsdata, {
    '10': { isOpen: false, groupname: 'Säugetiere' },
    '20': { isOpen: false, groupname: 'Insekten' },
    '30': {
      isOpen: false, groupname: 'Fische'
    }
  });
  let fg = m.filterGroups(groupingCols, m.groupsdata);
  assert.deepEqual(fg, [
    ['  ', 1, -1, 'Wolperdinger', 'Wolperdinger', '31.08.1915', 'Herder, Johann Gottfried', 5],
    ['  ', 1, -1, 'Yeti        ', 'Yeti        ', '31.08.2016', 'Lichtenberg, Georg Christoph ', 31],
    ['GA', 5, 10, 'Säugetiere 10', 'Säugetiere  ', '', '', 0],
    ['GA', 4, 20, 'Insekten 20', 'Insekten    ', '', '', 0],
    ['GA', 2, 30, 'Fische 30', 'Fische      ', '', '', 0],
    ['  ', 1, -1, 'Einhorn     ', 'Einhorn     ', '04.11.2017', 'Goethe, Johann Wolfgang', 63]
  ]);
  m.groupsdata[20].isOpen = true;
  fg = m.filterGroups(groupingCols, m.groupsdata);
  assert.deepEqual(fg, [
    ['  ', 1, -1, 'Wolperdinger', 'Wolperdinger', '31.08.1915', 'Herder, Johann Gottfried', 5],
    ['  ', 1, -1, 'Yeti        ', 'Yeti        ', '31.08.2016', 'Lichtenberg, Georg Christoph ', 31],
    ['GA', 5, 10, 'Säugetiere 10', 'Säugetiere  ', '', '', 0],
    ['GA', 4, 20, 'Insekten 20', 'Insekten    ', '', '', 0],
    ['GB', 1, 20, 'Insekten 20', 'Fliege      ', '31.08.2009', 'Mann, Thomas', 0],
    ['GB', 1, 20, 'Insekten 20', 'Biene       ', '31.08.2001', 'Lessing, Gottfried', 7],
    ['GA', 2, 30, 'Fische 30', 'Fische      ', '', '', 0],
    ['  ', 1, -1, 'Einhorn     ', 'Einhorn     ', '04.11.2017', 'Goethe, Johann Wolfgang', 63]
  ]);
  assert.deepEqual(fg.sort(m.rowCmpCols([{ col: 2, sortorder: 'asc' }, { col: 0, sortorder: 'asc-fix' }, {
      col: 5,
      sortorder: 'asc',
      sortformat: 'date-de'
    }])), [
      ['  ', 1, -1, 'Wolperdinger', 'Wolperdinger', '31.08.1915', 'Herder, Johann Gottfried', 5],
      ['  ', 1, -1, 'Yeti        ', 'Yeti        ', '31.08.2016', 'Lichtenberg, Georg Christoph ', 31],
      ['  ', 1, -1, 'Einhorn     ', 'Einhorn     ', '04.11.2017', 'Goethe, Johann Wolfgang', 63],
      ['GA', 5, 10, 'Säugetiere 10', 'Säugetiere  ', '', '', 0],
      ['GA', 4, 20, 'Insekten 20', 'Insekten    ', '', '', 0],
      ['GB', 1, 20, 'Insekten 20', 'Biene       ', '31.08.2001', 'Lessing, Gottfried', 7],
      ['GB', 1, 20, 'Insekten 20', 'Fliege      ', '31.08.2009', 'Mann, Thomas', 0],
      ['GA', 2, 30, 'Fische 30', 'Fische      ', '', '', 0]
    ]
  );
});

QUnit.test('testset: sorting functions', function(assert) {
  const m = mx(tblData.slice());
  const groupingCols = {
    grouplabel: 0,
    groupcnt: 1,
    groupid: 2,
    groupsortstring: 3,
    groupname: 4,
    grouphead: 'GA',
    groupelem: 'GB'
  };
  m.initGroups(groupingCols);
  assert.deepEqual(m.sort(m.rowCmpCols([{ col: 2, sortorder: 'asc' }, { col: 0, sortorder: 'asc-fix' }, {
    col: 5,
    sortorder: 'asc',
    sortformat: 'date-de'
  }])), [
    ['  ', 1, -1, 'Wolperdinger', 'Wolperdinger', '31.08.1915', 'Herder, Johann Gottfried', 5],
    ['  ', 1, -1, 'Yeti        ', 'Yeti        ', '31.08.2016', 'Lichtenberg, Georg Christoph ', 31],
    ['  ', 1, -1, 'Einhorn     ', 'Einhorn     ', '04.11.2017', 'Goethe, Johann Wolfgang', 63],
    ['GA', 5, 10, 'Säugetiere 10', 'Säugetiere  ', '', '', 0],
    ['GB', 1, 10, 'Säugetiere 10', 'Esel        ', '05.08.2011', 'Liebig, Ellen,', 1],
    ['GB', 1, 10, 'Säugetiere 10', 'Affe        ', '10.06.2013', 'Heine, Heinrich', 2],
    ['GA', 4, 20, 'Insekten 20', 'Insekten    ', '', '', 0],
    ['GB', 1, 20, 'Insekten 20', 'Biene       ', '31.08.2001', 'Lessing, Gottfried', 7],
    ['GB', 1, 20, 'Insekten 20', 'Fliege      ', '31.08.2009', 'Mann, Thomas', 0],
    ['GA', 2, 30, 'Fische 30', 'Fische      ', '', '', 0],
    ['GB', 1, 30, 'Fische 30', 'Forelle     ', '31.08.2001', 'Lessing, Gottfried', 7],
    ['GB', 1, 30, 'Fische 30', 'Karpfen     ', '31.08.2009', 'Mann, Thomas', 0]
  ]);
  assert.deepEqual(m.sort(m.rowCmpCols([{ col: 2, sortorder: 'desc' }, { col: 0, sortorder: 'asc-fix' }, {
    col: 5,
    sortorder: 'desc',
    sortformat: 'date-de'
  }])), [
    ['GA', 2, 30, 'Fische 30', 'Fische      ', '', '', 0],
    ['GB', 1, 30, 'Fische 30', 'Karpfen     ', '31.08.2009', 'Mann, Thomas', 0],
    ['GB', 1, 30, 'Fische 30', 'Forelle     ', '31.08.2001', 'Lessing, Gottfried', 7],
    ['GA', 4, 20, 'Insekten 20', 'Insekten    ', '', '', 0],
    ['GB', 1, 20, 'Insekten 20', 'Fliege      ', '31.08.2009', 'Mann, Thomas', 0],
    ['GB', 1, 20, 'Insekten 20', 'Biene       ', '31.08.2001', 'Lessing, Gottfried', 7],
    ['GA', 5, 10, 'Säugetiere 10', 'Säugetiere  ', '', '', 0],
    ['GB', 1, 10, 'Säugetiere 10', 'Affe        ', '10.06.2013', 'Heine, Heinrich', 2],
    ['GB', 1, 10, 'Säugetiere 10', 'Esel        ', '05.08.2011', 'Liebig, Ellen,', 1],
    ['  ', 1, -1, 'Einhorn     ', 'Einhorn     ', '04.11.2017', 'Goethe, Johann Wolfgang', 63],
    ['  ', 1, -1, 'Yeti        ', 'Yeti        ', '31.08.2016', 'Lichtenberg, Georg Christoph ', 31],
    ['  ', 1, -1, 'Wolperdinger', 'Wolperdinger', '31.08.1915', 'Herder, Johann Gottfried', 5]
  ]);
  assert.deepEqual(m.sort(m.rowCmpCols([{ col: 3, sortorder: 'desc' }, { col: 0, sortorder: 'asc' }, {
    col: 4,
    sortorder: 'desc'
  }])), [
    ['  ', 1, -1, 'Yeti        ', 'Yeti        ', '31.08.2016', 'Lichtenberg, Georg Christoph ', 31],
    ['  ', 1, -1, 'Wolperdinger', 'Wolperdinger', '31.08.1915', 'Herder, Johann Gottfried', 5],
    ['GA', 5, 10, 'Säugetiere 10', 'Säugetiere  ', '', '', 0],
    ['GB', 1, 10, 'Säugetiere 10', 'Esel        ', '05.08.2011', 'Liebig, Ellen,', 1],
    ['GB', 1, 10, 'Säugetiere 10', 'Affe        ', '10.06.2013', 'Heine, Heinrich', 2],
    ['GA', 4, 20, 'Insekten 20', 'Insekten    ', '', '', 0],
    ['GB', 1, 20, 'Insekten 20', 'Fliege      ', '31.08.2009', 'Mann, Thomas', 0],
    ['GB', 1, 20, 'Insekten 20', 'Biene       ', '31.08.2001', 'Lessing, Gottfried', 7],
    ['GA', 2, 30, 'Fische 30', 'Fische      ', '', '', 0],
    ['GB', 1, 30, 'Fische 30', 'Karpfen     ', '31.08.2009', 'Mann, Thomas', 0],
    ['GB', 1, 30, 'Fische 30', 'Forelle     ', '31.08.2001', 'Lessing, Gottfried', 7],
    ['  ', 1, -1, 'Einhorn     ', 'Einhorn     ', '04.11.2017', 'Goethe, Johann Wolfgang', 63]
  ]);
});