//  2-dimensional array -- m(atri)x
const mx = (m, groupDef) => {
  // groupDef see below
  const range = (n) => [...Array(n).keys()];
  const basicApi = {
    row: (n) => m[n],
    col: (n) => m.map((r) => r[n]),
    rows: (p) => m.filter((r, idx) => (!Array.isArray(p) ? p(m[r]) : p.indexOf(idx) >= 0)) // p = predicate-function or arr  ~ [1,4,5]
  };

  //####################################  filtering #######################
  const filtering = (() => {
    const fcts = {
      // filters [{col, searchText, renderer}, ...]
      rowMatch: (filters) => (row) =>
        (Array.isArray(filters) ? filters : [filters]).reduce((acc, f) => {
          const cellData = row[f.col].trim();
          const matchFct = f.match || mx.matcher['starts-with-matches'];
          return acc && matchFct(cellData, f.searchtext, row, m);
        }, true),
      filterData: (filters) => m.filter(fcts.rowMatch(filters))
    };
    return {
      filterData: fcts.filterData
    };
  })();

  //####################################  grouping #######################
  const grouping = (() => {
    // // groupDefs  ~ {grouplabel: 0, groupcnt: 1, groupid: 2, groupsortstring: 3, groupname: 4, grouphead: 'GA', groupelem: 'GB'}
    const fcts = {
      normalizeGroupId: (id) => (id <= 0 ? 0 : id),
      isGroupingHeader: (row, groupDefs) => row[groupDefs.grouplabel] === groupDefs.grouphead,
      initGroups: (groupDefs) => {
        if (!groupDefs.groupid) return;
        let row, groupId;
        const groupsData = m.groupsData || {};
        for (let r = 0; r < m.length; r++) {
          row = m[r];
          groupId = fcts.normalizeGroupId(row[groupDefs.groupid]);
          row.isGroupHeader = row[groupDefs.grouplabel] === groupDefs.grouphead;
          row.isGroupElement = groupId && !row.isGroupHeader;
          if (groupId && !groupsData[groupId]) {
            groupsData[groupId] = {
              isOpen: false,
              groupname: row[groupDefs.groupname].trim()
            };
          }
        }
        for (let r = 0; r < m.length; r++) {
          row = m[r];
          groupId = fcts.normalizeGroupId(row[groupDefs.groupid]);
          row[groupDefs.groupsortstring] = groupId ? groupsData[groupId].groupname + ' ' + groupId : row[groupDefs.groupname];
        }
        m.groupsdata = groupsData;
        return m;
      },
      filterGroups: (groupDefs, groupsdata) => {
        const filteredData = m.filter((row) => {
          const groupId = fcts.normalizeGroupId(row[groupDefs.groupid]);
          return !groupId || fcts.isGroupingHeader(row, groupDefs) || groupsdata[groupId].isOpen;
        });
        filteredData.groupsdata = m.groupsdata;
        return filteredData;
      },
      getGroupRows: (groupDefs, groupid) => m.filter((row) => row[groupDefs.groupid] === groupid)
    };
    return {
      initGroups: fcts.initGroups,
      filterGroups: fcts.filterGroups,
      getGroupRows: fcts.getGroupRows
    };
  })();
  //####################################  sorting #######################
  const sorting = (() => {
    const fcts = {
      rowCmpCols: (colDefs, groups) => {
        const toLower = (o) => (typeof o === 'string' ? o.toLowerCase() : o);
        const prepareItem = (row, col, fmt, groups, sortorder) => {
          const v = row[col] || '';
          return toLower(fmt ? fmt(v, row, groups, sortorder) : v);
        };
        colDefs = Array.isArray(colDefs) ? colDefs : [colDefs]; // [ {col:1,sortorder:asc,sortformat:fmtfct1},{col:3, sortorder:desc, sortformat:fmtfct2},... ]
        return (r1, r2) => {
          for (let i = 0; i < colDefs.length; i++) {
            const cdef = colDefs[i];
            const fmt = cdef.sortformat ? mx.sortformats[cdef.sortformat] : undefined;
            const x = prepareItem(r1, cdef.col, fmt, groups, cdef.sortorder);
            const y = prepareItem(r2, cdef.col, fmt, groups, cdef.sortorder);
            let ret = 0;
            if (typeof x === 'string' && typeof y === 'string') {
              ret = x.localeCompare(y);
            } else {
              ret = x < y ? -1 : x > y ? 1 : 0;
            }
            if (ret !== 0) {
              const bAsc = !cdef.sortorder || cdef.sortorder.indexOf('desc') < 0;
              return bAsc ? ret : -ret;
            }
          }
          return 0;
        };
      }
    };
    return {
      rowCmpCols: fcts.rowCmpCols
    };
  })();
  //####################################  paging #######################
  const paging = (() => {
    let page = 0;
    let pageSize = 10; // fcts.setPageSize(10);
    let pageMax = Math.floor((m.length - 1) / pageSize);

    const fcts = {
      setPageSize: (n) => {
        page = 0;
        pageSize = n;
        pageMax = Math.floor((m.length - 1) / n);
      },
      getCurPageData: () => {
        const startRow = pageSize * page;
        return m.rows(range(startRow, startRow + pageSize));
      }
    };
    return {
      pageFirst: () => (page = 0),
      pagePrev: () => (page = Math.max(0, page - 1)),
      pageNext: () => (page = Math.min(page + 1, pageMax)),
      pageLast: () => (page = pageMax),
      setPageSize: fcts.setPageSize,
      getCurPageData: fcts.getCurPageData
    };
  })();
  //#####################################################################

  const apis = { ...basicApi, ...sorting, ...filtering, ...grouping, ...paging };
  Object.keys(apis).forEach((k) => (m[k] = apis[k]));

  if (groupDef) {
    m.initGroups(groupDef);
  }
  return m;
};

// ##########  matcher ############

mx.matcher = (() => {
  const getFormattedDate = (date) => {
    const d = ('0' + date.getDate()).slice(-2);
    const m = ('0' + (date.getMonth() + 1)).slice(-2);
    const y = date.getFullYear();
    const hs = ('0' + date.getHours()).slice(-2);
    const ms = ('0' + date.getMinutes()).slice(-2);
    const ss = ('0' + date.getSeconds()).slice(-2);
    return d + '.' + m + '.' + y + ' ' + hs + ':' + ms + ':' + ss;
  };
  return {
    matches: (cellData, searchTxt) => cellData.match(new RegExp('.*' + searchTxt, 'i')),
    contains: (cellData, searchTxt) => cellData.toLowerCase().includes(searchTxt.toLowerCase()),
    'starts-with': (cellData, searchTxt) => cellData.toLowerCase().startsWith(searchTxt.toLowerCase()),
    'starts-with-matches': (cellData, searchTxt) => cellData.match(new RegExp('^' + searchTxt.replace(/\*/g, '.*'), 'i')),
    'matches-date': (cellData, searchTxt) => getFormattedDate(new Date(parseInt(cellData))).startWith(searchTxt),
    'matches-date-time': (cellData, searchTxt) => getFormattedDate(new Date(parseInt(cellData))).startWith(searchTxt),
    'matches-date-time-sec': (cellData, searchTxt) => getFormattedDate(new Date(parseInt(cellData))).startWith(searchTxt)
  };
})();

// ##########  sortformats ############

mx.sortformats = {
  'date-de': function (a) {
    // '01.01.2013' -->   '20130101'
    const d = a.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    return d ? d[3] + d[2] + d[1] : '';
  },
  'datetime-de': function (a) {
    // '01.01.2013 12:36'  -->  '201301011236'
    const d = a.match(/^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2})$/);
    return d ? d[3] + d[2] + d[1] + d[4] + d[5] : '';
  },
  'datetime-sec-de': function (a) {
    // '01.01.2013 12:36:59'  -->  '20130101123659'
    const d = a.match(/^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2}):(\d{2})$/);
    return d ? d[3] + d[2] + d[1] + d[4] + d[5] + d[6] : '';
  },
  scientific: function (a) {
    // '1e+3'  -->  '1000'
    return parseFloat(a);
  }
};
