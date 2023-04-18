/* global QUnit, mx */
QUnit.test('testset: matcher', (assert) => {
  assert.true(mx.matcher['contains']('Das ist ein einfacher Test', "Test"));
  assert.false(mx.matcher['contains']('Das ist ein einfacher Test', "AAA"));

  assert.true(mx.matcher['starts-with']('Das ist ein einfacher Test', "Das "));
  assert.false(mx.matcher['starts-with']('Das ist ein einfacher Test', "AAA"));

  assert.true(!!mx.matcher['matches']('Das ist ein einfacher Test', "Das"));
  assert.true(!!mx.matcher['matches']('Das ist ein einfacher Test', "einfacher"));
  assert.false(!!mx.matcher['matches']('Das ist ein einfacher Test', "XXX"));

  assert.true(!!mx.matcher['starts-with-matches']('Das ist ein einfacher Test', "Das"));
  assert.true(!!mx.matcher['starts-with-matches']('Das ist ein einfacher Test', "*Das*"));
  assert.true(!!mx.matcher['starts-with-matches']('Das ist ein einfacher Test', "Das*ein"));
  assert.true(!!mx.matcher['starts-with-matches']('Das ist ein einfacher Test', "Das*ein*TEST"));
  assert.false(!!mx.matcher['starts-with-matches']('Das ist ein einfacher Test', "A*Das*"));
  assert.false(!!mx.matcher['matches']('Schiller, Friedrich', "he*"));

});
