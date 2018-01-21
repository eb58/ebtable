/* global _ */

function clearLocalStorage() {
  _.keys(localStorage).forEach(function (o, idx) {
    console.log(o, idx);
    o.indexOf('unittest') > 0 && delete localStorage[o];
  })
}
function getCol(gridname, n) {
  return $('#' + gridname + ' table tbody td:nth-child(' + n + ')').toArray().reduce(function (acc, o) {
    acc.push($(o).text().trim());
    return acc;
  }, [])
}
function reinit(gridname, opts, data) {
  clearLocalStorage();
  $('#' + gridname).ebtable(opts, data);
}
