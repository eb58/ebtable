$.fn.ebpager = function (opts) {
  if (!opts.pagerId) throw Error('pagerId option must be set!');
  if (opts.lengthOfData === undefined) throw Error('length option must be set!');
  if (opts.rowsPerPageSelectValues && opts.rowsPerPage !== opts.rowsPerPageSelectValues[0]) throw Error('rowsPerPage must be equal to first in rowsPerPageSelectValues!');

  const template = (str) => (opts) => Object.keys(opts).reduce((acc, key) => acc.replaceAll(`<%=${key}%>`, opts[key] || ''), str.replace(/<%= */g, '<%=').replace(/ *%>/g, '%>'));
  const translate = (str) => $.fn.ebpager.lang[myOpts.lang || 'de'][str] || str;

  const defOpts = {
    withPageLengthCtrl: true,
    rowsPerPageSelectValues: [5, 10, 25, 50, 100],
    rowsPerPage: 5
  };

  const myOpts = { ...defOpts, ...opts };
  let currentPageMax = Math.floor(Math.max(0, myOpts.lengthOfData - 1) / myOpts.rowsPerPage);
  let currentPage = 0;

  const selectLenCtrl = () => {
    if (!myOpts.withPageLengthCtrl) return '';
    const options = myOpts.rowsPerPageSelectValues.reduce((acc, o) => {
      return acc + `<option value='${o}' ${o === myOpts.rowsPerPage ? 'selected' : ''}>${o}</option>`;
    }, '');
    return `<select id='pageLenCtrl'>${options}></select>`;
  };

  const ctrlInfo = () => {
    const start = Math.min(myOpts.rowsPerPage * currentPage + 1, myOpts.lengthOfData);
    const end = Math.min(start + myOpts.rowsPerPage - 1, myOpts.lengthOfData);
    return template(translate('<%=start%>-<%=end%> von <%=count%> Zeilen'))({
      start,
      end,
      count: myOpts.lengthOfData
    });
  };

  this.html(`
    <span id=${opts.pagerId} class='eb-pager'>
      <button class='firstBtn'>&#8676;</button>
      <button class='prevBtn'>&larr;</button>
      <span class='ctrlSelect'>${selectLenCtrl()}</span>
      <button class='nextBtn'>&rarr;</button>
      <button class='lastBtn'>&#8677;</button>
      <span class='ctrlInfo'>${ctrlInfo()}</span>
    </span>`);

  // On change page length
  $('#' + myOpts.pagerId + ' #pageLenCtrl').on('change', (ev) => {
    myOpts.rowsPerPage = Number($(ev.target).val());
    currentPage = 0;
    currentPageMax = Math.floor(Math.max(0, myOpts.lengthOfData - 1) / myOpts.rowsPerPage);
    myOpts.saveState && myOpts.saveState();
    setCurrentPage(0);
  });

  const setCurrentPage = (n) => {
    currentPage = Math.min(Math.max(0, n), currentPageMax);
    $(`#${myOpts.pagerId}.ctrlInfo`).text(ctrlInfo());
    $(`#${myOpts.pagerId}.firstBtn`).prop('disabled', currentPage === 0);
    $(`#${myOpts.pagerId}.prevBtn`).prop('disabled', currentPage === 0);
    $(`#${myOpts.pagerId}.nextBtn`).prop('disabled', currentPage === currentPageMax);
    $(`#${myOpts.pagerId}.lastBtn`).prop('disabled', currentPage === currentPageMax);
    $.publish('ebpager:current-page', currentPage);
  };
  const addHandler = (selector, action) =>
    $('#' + myOpts.pagerId + ' ' + selector)
      .off()
      .on('click', action);

  addHandler('.firstBtn', () => setCurrentPage(0));
  addHandler('.prevBtn', () => setCurrentPage(currentPage - 1));
  addHandler('.nextBtn', () => setCurrentPage(currentPage + 1));
  addHandler('.lastBtn', () => setCurrentPage(currentPageMax));
  setCurrentPage(0);

  return this;
};

$.fn.ebpager.lang = {
  de: {},
  en: {
    '<%=start%>-<%=end%> von <%=count%> Zeilen': '<%=start%> to <%=end%> of <%=count%> rows'
  }
};
