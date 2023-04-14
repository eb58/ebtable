/* global QUnit, mx */
QUnit.test('testset: sortformats', (assert) => {
  assert.equal(mx.sortformats['date-de']('01.03.2013'), '20130301');
  assert.equal(mx.sortformats['datetime-de']('04.01.2013 12:36'), '201301041236');
  assert.equal(mx.sortformats['datetime-sec-de']('29.12.1999 12:29:59'), '19991229122959');
});
