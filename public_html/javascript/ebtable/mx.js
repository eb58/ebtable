//  2-dimensional array -- m(atri)x
const mx = (m, groupdef) => {  //groupdef see below 

  const range = n => [...Array(n).keys()];
  const isArray = o => Array.isArray(o);
  const isFunction = o => typeof o === 'function';
  const isString = o => typeof o === 'string';
  const cmp = (x, y) => (x < y) ? -1 : ((x > y) ? 1 : 0);

  const basicapi = {
    zero: () => m.fill(0),
    row: n => m[n],
    rows: p => m.filter((r, idx) => isFunction(p) ? p(m[r]) : p.indexOf(idx) >= 0), // p = predicate-function or array [1,4,5]
    withoutRows: p => m.filter((r, idx) => isFunction(p) ? !p(r) : p.indexOf(idx) < 0), // p = predicate-function or array [1,4,5]
    col: n => range(m.length).map(r => m[r][n]),
    cols: arr => m.map(row => row.filter((x, idx) => arr.includes(idx))),
    withoutCols: arr => m.map(row => row.filter((x, idx) => !arr.includes(idx)))
  };
//####################################  filtering #######################
  const filtering = (() => {
    const rowMatch = filters => row => (isArray(filters) ? filters : [filters]).reduce((acc, f) => {
          const cellData = (''+row[f.col]).trim()
          const matchfct = f.match || $.fn.ebtable.matcher['starts-with-matches'];
          return acc && matchfct(cellData, f.searchtext, row, m);
        }, true);
    const filterData = filters => m.filter(rowMatch(filters)); // filters [{col: col, searchtext: text, render:myrenderer},...]
    return {
      filterData
    };
  })();
//####################################  grouping #######################
  const grouping = (() => {
    // // groupdefs  ~ {grouplabel: 0, groupcnt: 1, groupid: 2, groupsortstring: 3, groupname: 4, grouphead: 'GA', groupelem: 'GB'}
    const fcts = {
      normalizeGroupId: id => id <= 0 ? 0 : id,
      isGroupingHeader: (row, groupdefs) => row[groupdefs.grouplabel] === groupdefs.grouphead,
      initGroups: groupdefs => {
        if (!groupdefs.groupid)
          return;
        let row, groupId;
        const groupsdata = m.groupsdata || {};
        for (let r = 0; r < m.length; r++) {
          row = m[r];
          groupId = fcts.normalizeGroupId(row[groupdefs.groupid]);
          row.isGroupHeader = row[groupdefs.grouplabel] === groupdefs.grouphead;
          row.isGroupElement = groupId && !row.isGroupHeader;
          if (groupId && !groupsdata[groupId]) {
            groupsdata[groupId] = {isOpen: false, groupname: $.trim(row[groupdefs.groupname])};
          }
        }
        for (let r = 0; r < m.length; r++) {
          row = m[r];
          groupId = fcts.normalizeGroupId(row[groupdefs.groupid]);
          row[groupdefs.groupsortstring] = groupId ? (groupsdata[groupId].groupname + ' ' + groupId) : row[groupdefs.groupname];
        }
        m.groupsdata = groupsdata;
        return m;
      },
      filterGroups: (groupdefs, groupsdata) => {
        const filteredData = m.filter(row => {
          const groupId = fcts.normalizeGroupId((row[groupdefs.groupid]));
          return(!groupId || fcts.isGroupingHeader(row, groupdefs) || groupsdata[groupId].isOpen);
        });
        filteredData.groupsdata = m.groupsdata;
        return filteredData;
      },
      getGroupRows: (groupdefs, groupid) => m.filter(row => row[groupdefs.groupid] === groupid),
    };
    return {
      initGroups: fcts.initGroups,
      filterGroups: fcts.filterGroups,
      getGroupRows: fcts.getGroupRows
    };
  })();
  //####################################  sorting #######################
  sorting = (function () {
    var fcts = {
      toLower: o => isString(o) ? o.toLowerCase() : o,
      isAsc: cdef => !cdef.sortorder || cdef.sortorder.indexOf('desc') < 0,
      prepareItem: (row, col, fmt, groups, sortorder) => fcts.toLower(fmt ? fmt(row[col] || '', row, groups, sortorder) : row[col] || ''),
      rowCmpCols: function rowCmpCols(coldefs, groups) {
        coldefs = isArray(coldefs) ? coldefs : [coldefs]; // [ {col:1,sortorder:asc,sortformat:fmtfct1},{col:3, sortorder:desc, sortformat:fmtfct2},... ]  
        return (r1, r2) => {
          for (let i = 0; i < coldefs.length; i++) {
            const cdef = coldefs[i];
            const fmt = cdef.sortformat ? $.fn.ebtable.sortformats[cdef.sortformat] : undefined;
            const x = fcts.prepareItem(r1, cdef.col, fmt, groups, cdef.sortorder);
            const y = fcts.prepareItem(r2, cdef.col, fmt, groups, cdef.sortorder);
            const ret = (isString(x) && isString(y)) ? x.localeCompare(y) : cmp(x, y);
            if (ret !== 0) {
              const bAsc = !cdef.sortorder || cdef.sortorder.indexOf('desc') < 0;
              return bAsc ? ret : -ret;
            }
          }
          return 0;
        }
      }
    };
    return {
      rowCmpCols: fcts.rowCmpCols
    };
  })();
  //####################################  pageing #######################
  const pageing = (() => {
    const [page, pageSize] = [0, 10];
    const pageMax = Math.floor((m.length - 1) / pageSize);
    const api = {
      pageFirst: () => curPage = 0,
      pagePrev: () => curPage = Math.max(0, curPage - 1),
      pageNext: () => curPage = Math.min(curPage + 1, pageMax),
      pageLast: () => curPage = pageMax,
      setPageSize: n => [curPage, pageSize, pageMax] = [0, n, Math.floor((m.length - 1) / n)],
      getCurPageData: () => basicapi.rows(range(pageSize * curPage, pageSize * curPage + pageSize)),
    };
    return api;
  })();
  //#####################################################################

  const res = Object.assign(m, basicapi, sorting, filtering, grouping);
  if (groupdef) {
    res.initGroups(groupdef);
  }
  return res;
};
