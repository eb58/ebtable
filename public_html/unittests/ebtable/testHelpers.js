/* global _ */

const clearLocalStorage = () => Object.keys(localStorage).forEach((o) => o.includes('unittest') && delete localStorage[o]);

const getCol = (gridname, n) =>
  $('#' + gridname + ' table tbody td:nth-child(' + n + ')')
    .toArray()
    .reduce((acc, o) => [...acc, $(o).text().trim()], []);

const reinit = (gridname, opts, data) => {
  clearLocalStorage();
  $('#' + gridname).ebtable(opts, data);
};
