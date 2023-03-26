/* global _ */

function clearLocalStorage() {
    Object.keys(localStorage).forEach(function (o, idx) {
        console.log(o, idx);
        o.indexOf('unittest') > 0 && delete localStorage[o];
    })
}

const getCol = (gridname, n) => $('#' + gridname + ' table tbody td:nth-child(' + n + ')')
    .toArray()
    .reduce((acc, o) =>[...acc, $(o).text().trim()], [])

function reinit(gridname, opts, data) {
    clearLocalStorage();
    $('#' + gridname).ebtable(opts, data);
}
