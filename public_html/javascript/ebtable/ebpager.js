$.fn.ebpager = function (opts, callback) {
  const template = (str) => (opts) => Object.keys(opts).reduce((acc, key) => acc.replaceAll(`<%=${key}%>`, opts[key] || ''), str.replace(/<%= */g, '<%=').replace(/ *%>/g, '%>'));
  const translate = (str) => $.fn.ebpager.lang[myOpts.lang || 'de'][str] || str;

  if (opts.lengthOfData === undefined) throw Error('length option must be set!');

  const defOpts = {
    pagerId: '',
    withPagelenctrl: true,
    rowsPerPageSelectValues: [5, 10, 25, 50, 100],
    rowsPerPage: 5
  };

  const myOpts = { ...defOpts, ...opts };
  let currentPageMax = Math.floor(Math.max(0, myOpts.lengthOfData - 1) / myOpts.rowsPerPage);
  let currentPage = 0;

  const selectLenCtrl = () => {
    if (!myOpts.withPagelenctrl) return '';
    const options = myOpts.rowsPerPageSelectValues.reduce((acc, o) => {
      return acc + `<option value='${o}' ${o === myOpts.rowsPerPage ? 'selected' : ''}>${o}</option>`;
    }, '');
    return `<select id='pageLenCtrl'>${options}></select>`;
  };

  const ctrlInfo = () => {
    const startRow = Math.min(myOpts.rowsPerPage * currentPage + 1, myOpts.lengthOfData);
    const endRow = Math.min(startRow + myOpts.rowsPerPage - 1, myOpts.lengthOfData);
    return template(translate('<%=start%>-<%=end%> von <%=count%> Zeilen'))({
      start: startRow,
      end: endRow,
      count: myOpts.lengthOfData
    });
  };

  this.html(`
    <span class='eb-pager'>
      <span class='ctrlInfo'></span>
      <button class='firstBtn'>&#8676;</button>
      <button class='prevBtn'> &larr; </button>
      <span class='ctrlSelect'></span>
      <button class='nextBtn'> &rarr; </button>
      <button class='lastBtn'> &#8677;</button>
    </span>`);
  $(myOpts.pagerId + '.ctrlInfo').text(ctrlInfo());
  $(myOpts.pagerId + '.ctrlSelect').html(selectLenCtrl());

  // On change page length
  $(myOpts.pagerId + '#pageLenCtrl').on('change', (ev) => {
    myOpts.rowsPerPage = Number($(ev.target).val());
    currentPage = 0;
    currentPageMax = Math.floor(Math.max(0, myOpts.lengthOfData - 1) / myOpts.rowsPerPage);
    myOpts.saveState && myOpts.saveState();
    setCurrentPage(0);
  });

  const setCurrentPage = (n) => {
    currentPage = Math.min(Math.max(0, n), currentPageMax);
    $(myOpts.pagerId + '.ctrlInfo').text(ctrlInfo());
    callback && callback(currentPage);
  };
  const addHandler = (selector, action) =>
    $(myOpts.pagerId + selector)
      .off()
      .on('click', action);

  addHandler(myOpts.pagerId + '.firstBtn', () => setCurrentPage(0));
  addHandler(myOpts.pagerId + '.prevBtn', () => setCurrentPage(currentPage - 1));
  addHandler(myOpts.pagerId + '.nextBtn', () => setCurrentPage(currentPage + 1));
  addHandler(myOpts.pagerId + '.lastBtn', () => setCurrentPage(currentPageMax));

  return this;
};

$.fn.ebpager.lang = {
  de: {},
  en: {
    '<%=start%>-<%=end%> von <%=count%> Zeilen': '<%=start%> to <%=end%> of <%=count%> rows'
  }
};
