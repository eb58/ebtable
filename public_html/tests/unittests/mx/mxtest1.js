/* global QUnit, mx */

QUnit.test('testset: easy ones', function (assert) {
  assert.deepEqual(mx([[1, 2, 3], [4, 5, 6], [7, 8, 9]]), [[1, 2, 3], [4, 5, 6], [7, 8, 9]]);

  var m = mx([[1, 2], [3, 4]]);
  assert.deepEqual(m, [[1, 2], [3, 4]]);
  assert.deepEqual(m.col(0), [1, 3]);
  assert.deepEqual(m.col(1), [2, 4]);

  var m = mx([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
  assert.deepEqual(m.rows([1, 2]), [[4, 5, 6], [7, 8, 9]]);
  assert.deepEqual(m.rows([0]), [[1, 2, 3]]);
  assert.deepEqual(m.rows([0, 2]), [[1, 2, 3], [7, 8, 9]]);

  assert.deepEqual(m.withoutRows([1, 2]), [[1, 2, 3]]);
  assert.deepEqual(m.withoutRows([0]), [[4, 5, 6], [7, 8, 9]]);
  assert.deepEqual(m.withoutRows([0, 2]), [[4, 5, 6]]);
  assert.deepEqual(m.cols([0, 1]), [[1, 2], [4, 5], [7, 8]]);
  assert.deepEqual(m.withoutCols([0, 1]), [[3], [6], [9]]);

  var m = mx([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
  assert.deepEqual(m.withoutRows([0, 2]), [[4, 5, 6]]);
  assert.deepEqual(m.withoutRows(function (row) {
    return row[0] === 4;
  }), [[1, 2, 3], [7, 8, 9]]);

  var m = mx([['11', '12', '13'], ['21', '22', '23'], ['31', '32', '33']]);
  assert.deepEqual(m.withoutRows([0, 2]), [['21', '22', '23']]);
  assert.deepEqual(m.withoutRows(function (row) {
    return row[0] === '21';
  }), [['11', '12', '13'], ['31', '32', '33']]);

});

QUnit.test('testset: sorting functions', function (assert) {
  var m = mx([['11', '12', '13'], ['31', '32', '33'], ['21', '22', '23']]);
  assert.deepEqual(m.length, 3);
  assert.deepEqual(m.sort(), [['11', '12', '13'], ['21', '22', '23'], ['31', '32', '33']]);
  assert.deepEqual(m.sort(m.rowCmpCols({col: 1, sortorder: 'desc'})), [['31', '32', '33'], ['21', '22', '23'], ['11', '12', '13']]);
  assert.deepEqual(m.sort(m.rowCmpCols({col: 1, sortorder: 'asc'})), [['11', '12', '13'], ['21', '22', '23'], ['31', '32', '33']]);
  assert.deepEqual(m.sort(m.rowCmpCols({col: 3, sortorder: 'asc'})), [['11', '12', '13'], ['21', '22', '23'], ['31', '32', '33']]);

  var m = mx([['04.01.2011'], ['01.01.2015'], ['03.01.2013'], ['17.01.2001']]);
  assert.deepEqual(m.sort(m.rowCmpCols({col: 0, sortorder: 'asc', sortformat: 'date-de'})), [['17.01.2001'], ['04.01.2011'], ['03.01.2013'], ['01.01.2015']]);
  assert.deepEqual(m.sort(m.rowCmpCols({col: 0, sortorder: 'desc', sortformat: 'date-de'})), [['01.01.2015'], ['03.01.2013'], ['04.01.2011'], ['17.01.2001']]);

  var m = mx([['04.01.2011 12:34'], ['03.01.2013 13:35'], ['01.01.2015 13:34'], ['03.01.2013 13:36'], ['17.01.2001 07:30']]);
  assert.deepEqual(m.sort(m.rowCmpCols({col: 0, sortorder: 'asc', sortformat: 'datetime-de'})), [['17.01.2001 07:30'], ['04.01.2011 12:34'], ['03.01.2013 13:35'], ['03.01.2013 13:36'], ['01.01.2015 13:34']]);
  assert.deepEqual(m.sort(m.rowCmpCols({col: 0, sortorder: 'desc', sortformat: 'datetime-de'})), [["01.01.2015 13:34"], ["03.01.2013 13:36"], ["03.01.2013 13:35"], ["04.01.2011 12:34"], ["17.01.2001 07:30"]]);

  var m = mx([['04.01.2011 12:34:33'], ['03.01.2013 13:35:59']]);
  assert.deepEqual(m.sort(m.rowCmpCols({col: 0, sortorder: 'asc', sortformat: 'datetime-sec-de'})), [['04.01.2011 12:34:33'], ['03.01.2013 13:35:59']]);
  assert.deepEqual(m.sort(m.rowCmpCols({col: 0, sortorder: 'desc', sortformat: 'datetime-sec-de'})), [['03.01.2013 13:35:59'], ['04.01.2011 12:34:33']]);

});

QUnit.test('testset: filtering functions', function (assert) {
  var m = mx([['test', '01.01.2011'], ['', '01.01.2015'], ['', '01.01.2013'], ['testA', '01.01.2001'], ['Abc', ''], ['bc', '']]);
  assert.deepEqual(m.filterData({col: 0, searchtext: 'te'}), [['test', '01.01.2011'], ['testA', '01.01.2001']]);
  assert.deepEqual(m.filterData({col: 0, searchtext: 'est'}), []);
  assert.deepEqual(m.filterData({col: 0, searchtext: 'testa'}), [['testA', '01.01.2001']]);
  assert.deepEqual(m.filterData({col: 0, searchtext: 'abc'}), [['Abc', '']]);
  assert.deepEqual(m.filterData({col: 0, searchtext: 'ABC'}), [['Abc', '']]);
  assert.deepEqual(m.filterData({col: 0, searchtext: 'A*'}), [['Abc', '']]);
  assert.deepEqual(m.filterData({col: 0, searchtext: '*b*'}), [['Abc', ''], ['bc', '']]);
});

