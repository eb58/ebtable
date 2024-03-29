const range = (n) => [...Array(n).keys()];
const uniq = (a) => Array.from(new Set(a));

const template = (str) => (opts) => Object.keys(opts).reduce((acc, key) => acc.replaceAll(`<%=${key}%>`, opts[key] || ''), str.replace(/<%= */g, '<%=').replace(/ *%>/g, '%>'));

const dlgConfig = (opts, callback) => {
  const listOfColumns = opts.listOfColumns.reduce(
    (acc, colDef) =>
      acc +
      template('<li id="<%=name%>" class="ui-widget-content <%=cls%>" style="<%=style%>"><%=name%></li>')({
        name: colDef.name,
        cls: colDef.invisible ? 'invisible' : 'visible',
        style: colDef.technical || colDef.mandatory ? 'display:none' : ''
      }),
    ''
  );

  const dlgTemplate = `
    <div id='configDlg' class='configDlg'>
      <ol id='listOfColumns' class='ebtableSelectable'>
        ${listOfColumns}
      </ol>
    </div>`;

  const dlgOpts = {
    open: () => {
      $('#configDlg #listOfColumns').sortable();
      $('#configDlg #listOfColumns li').on('click', (event) =>
        $('#configDlg [id="' + event.target.id + '"]')
          .toggleClass('invisible')
          .toggleClass('visible')
      );
    },
    title: opts.title,
    position: { my: 'left top', at: 'left bottom', of: opts.anchor },
    width: '300px',
    modal: true,
    buttons: {}
  };
  dlgOpts.buttons[opts.okString] = function () {
    const colDefs = $('#configDlg li')
      .toArray()
      .reduce((acc, o) => {
        const id = $(o).prop('id');
        const invisible = $(o).hasClass('invisible');
        return [...acc, { id, invisible }];
      }, []);
    callback(colDefs);
    $(this).dialog('destroy');
  };
  dlgOpts.buttons[opts.cancelString] = function () {
    $(this).dialog('destroy');
  };

  $(dlgTemplate).dialog(dlgOpts);
};

const checkConfig = (myOpts, origData) => {
  // set reasonable defaults for colDefs
  if (origData[0] && origData[0].length !== myOpts.columns.length) {
    localStorage[myOpts.localStorageKey] = '';
    throw Error("Data definition and column definition don't match! " + origData[0].length + ' ' + myOpts.columns.length);
  }
  const ls = localStorage[myOpts.localStorageKey];
  if (ls?.colorder && ls.colorder.length !== myOpts.columns.length) {
    localStorage[myOpts.localStorageKey] = '';
    throw Error("Column definition and localStorage don't match!" + ls.colorder.length + ' ' + myOpts.columns.length);
  }
  const msg = myOpts.columns.reduce((acc, col) => {
    acc = col.technical && !col.invisible ? [...acc, `${col.name}: technical column must be invisible!`] : acc;
    acc = col.mandatory && col.invisible ? [...acc, `${col.name}:  mandatory column must be visible!`] : acc;
    return acc;
  }, '');
  if (msg) throw Error(msg);
};

(function ($) {
  const docTitle = $(document).prop('title').replace(/ /g, '');
  const sessionStorageKey = 'ebtable-' + docTitle + '-v1.0';
  let suppressSorting = false;

  //###########################################################################################################

  $.fn.myFocus = function () {
    return this.prop('tabindex', 0).focus().prop('tabindex', -1);
  };

  $.fn.ebtable = function (opts, data, hasMoreResults) {
    const stateUtil = {
      // saving/loading state
      getStateAsJSON: () => {
        const stateGeneral = {
          rowsPerPage: myOpts.rowsPerPage,
          colorderByName: myOpts.colorder.map((idx) => myOpts.columns[idx].name),
          invisibleColnames: myOpts.columns.reduce((acc, o) => (o.invisible && !o.technical ? [...acc, o.name] : acc), [])
        };
        const stateWidth = myOpts.flags.colsResizable
          ? {
              colWidths: util.getColWidths()
            }
          : {};
        const state = { ...stateGeneral, ...stateWidth };
        return JSON.stringify(state);
      },
      saveState: () => (localStorage[localStorageKey] = stateUtil.getStateAsJSON()),
      getState: () => (localStorage[localStorageKey] ? JSON.parse(localStorage[localStorageKey]) : null),
      loadState: (state) => {
        if (!state) {
          util.setDefaultWidthForColumns();
          return;
        }
        myOpts.rowsPerPage = state.rowsPerPage;
        const cols1 = state.colorderByName.map((n) => util.colIdxFromName(n)).filter((n) => n >= 0);
        const cols2 = myOpts.columns.map((_, idx) => idx);
        myOpts.colorder = uniq([...cols1, ...cols2]);
        if (myOpts.flags.colsResizable) {
          myOpts.bodyWidth = state.bodyWidth;
          if (Array.isArray(state.colWidths)) {
            state.colWidths
              .map((col) => util.colDefFromName(col.name))
              .filter((colDef) => !!colDef)
              .forEach((colDef) => (colDef.width = colDef.width + 'px'));
          }
        }
        state.invisibleColnames.forEach((colname) => {
          const n = util.colIdxFromName(colname);
          if (n >= 0) {
            myOpts.columns[n].invisible = true;
          }
        });
      }
    };

    const saveSessionState = () => {
      const openGroups = Object.keys(origData.groupsdata || []).reduce((acc, key) => (origData.groupsdata[key].isOpen ? [...acc, Number(key)] : acc), []);
      sessionStorage[sessionStorageKey] = JSON.stringify({
        pageCur: self.getPageCur(),
        filters: filteringFunctions.getFilterValues(),
        myOpts: { ...myOpts, openGroups }
      });
    };

    // ##############################################################################

    const util = {
      log: (...args) => opts.debug && console.log(args),
      translate: (str) => $.fn.ebtable.lang[myOpts.lang || 'de'][str] || str,
      colIdxFromName: (colname) => myOpts.columns.findIndex((o) => o.name === colname),
      colDefFromName: (colname) => myOpts.columns.find((c) => c.name === colname),
      colIdFromName: (colname) => util.colDefFromName(colname).id,
      colNameFromId: (colid) => (myOpts.columns.find((c) => c.id === colid) || {}).name,
      getRender: (colname) => util.colDefFromName(colname).render,
      getMatch: (colname) => {
        const match = util.colDefFromName(colname).match;
        return (typeof match !== 'string' ? match : mx.matcher[match]) || mx.matcher['matches'];
      },

      getColWidths: () =>
        $(selGridId + '.ebtable th')
          .toArray()
          .map((o) => {
            const id = $(o).prop('id');
            const width = Math.max(20, $(o).width());
            const name = util.colNameFromId(id);
            util.log($(o).prop('id'), width, name);
            return { name, width };
          })
          .filter((o) => o.name),
      setDefaultWidthForColumns: () => {
        if (myOpts.flags.colsResizable) {
          $(selGridId + '#data table th').removeAttr('style');
          util
            .getColWidths()
            .map((o) => ({ id: util.colIdFromName(o.name), width: o.width }))
            .forEach((x) => $(selGridId + 'table th#' + x.id).width(x.width));
          stateUtil.saveState();
        }
      }
    };

    // ##############################################################################
    const reloading = (event) => {
      // reloading on <CR> in filter fields
      if (event.which === 13 && myOpts.reloadData) {
        util.log('reloading', event, event.which);
        myOpts.reloadData();
        event.preventDefault();
      }
    };

    const redrawAddInfo = () => {
      const addInfo = ctrlAddInfo();
      $(selGridId + '#ctrlAddInfo')
        .toggle(!!addInfo)
        .html(addInfo);
    };

    const redraw = (pageCur) => {
      const addInfo = ctrlAddInfo();
      $(selGridId + '.ebtable').width(myOpts.bodyWidth);
      $(selGridId + '#ctrlInfo').html(ctrlInfo());
      $(selGridId + '#ctrlAddInfo')
        .toggle(!!addInfo)
        .html(addInfo);
      $(selGridId + '#data tbody').html(tableData(pageCur));
      $(selGridId + '#data input[type=checkbox]').on('change', selectionFunctions.selectRows);
      $(selGridId + '#data input[type=radio]').on('change', selectionFunctions.selectRows);
      myOpts.selectionCol &&
        myOpts.selectionCol.selectOnRowClick &&
        $(selGridId + '#data tbody tr td').on('click', (e) => {
          if (!$(e.target).is('input')) $(e.target).parent().find('input').trigger('click');
        });
      myOpts.selectionCol && myOpts.selectionCol.singleSelection && $(selGridId + '#checkAll').hide();
      myOpts.afterRedraw && myOpts.afterRedraw($(gridId));
    };

    const redrawWithHeader = (pageCur) => {
      $(selGridId + 'thead tr').html(tableHead());
      initHeaderActions();
      redraw(pageCur);
    };

    const selectionFunctions = {
      selectRow: (rowNr, row, b) => {
        // b = true/false ~ on/off
        if (!row || row.disabled) return;

        myOpts.selectionCol.onStartSelection && myOpts.selectionCol.onStartSelection(rowNr, row, origData, b);

        row.selected = b;
        const gc = myOpts.groupDefs;
        const groupid = row[gc.groupid];
        if (gc && groupid && row[gc.grouplabel] === gc.grouphead) {
          util.log('Groupheader ' + (b ? 'selected!' : 'unselected!'), groupid, row[gc.grouplabel]);
          origData.getGroupRows(gc, groupid).forEach((o) => (o.selected = b));
          for (let i = 0; i < tblData.length; i++) {
            if (tblData[i][gc.groupid] === groupid) {
              $(selGridId + '#check' + i).prop('checked', b);
            }
          }
        } else {
          util.log('Row ' + (b ? 'selected!' : 'unselected!'), rowNr);
          $(selGridId + '#check' + rowNr).prop('checked', b);
        }
        myOpts.selectionCol && myOpts.selectionCol.onSelection && myOpts.selectionCol.onSelection(rowNr, row, origData, b);
        $(selGridId + ' #ctrlInfo').html(ctrlInfo());
      },
      selectRows: (event) => {
        // select row
        util.log('selectRows', event);
        if (!myOpts.selectionCol) return;

        const checked = $(event.target).prop('checked');
        if (event.target.id === 'checkAll') {
          if (checked) {
            myOpts.selectionCol.onSelectAll && myOpts.selectionCol.onSelectAll();
            tblData.forEach((row, rowNr) => selectionFunctions.selectRow(rowNr, tblData[rowNr], checked));
          } else {
            selectionFunctions.deselectAllRows();
          }
        } else {
          if (myOpts.selectionCol && myOpts.selectionCol.singleSelection) {
            tblData.forEach((row, rowNr) => {
              if (row.selected) selectionFunctions.selectRow(rowNr, row, false);
            });
          }
          const rowNr = event.target.id.replace('check', '');
          selectionFunctions.selectRow(rowNr, tblData[rowNr], checked);
          $(selGridId + '#checkAll').prop('checked', false);
        }
      },
      deselectAllRows: () => {
        if (!myOpts.selectionCol) return;
        if (myOpts.selectionCol.onUnselectAll) {
          myOpts.selectionCol.onUnselectAll();
        } else if (myOpts.selectionCol.onSelection) {
          origData.forEach((row, rowNr) => {
            if (row.selected) {
              selectionFunctions.selectRow(rowNr, row, false);
            }
          });
        }
        $(selGridId + '#data input[type=checkbox]').prop('checked', false);
        origData.forEach((row) => (row.selected = false));
        $(selGridId + ' #ctrlInfo').html(ctrlInfo());
      },
      iterateSelectedValues: (fct) => tblData.filter((row) => row.selected).forEach(fct),
      getSelectedRows: () => tblData.filter((row) => row.selected),
      setSelectedRows: (predicateFct) => {
        tblData.forEach((row) => (row.selected = predicateFct(row)));
        redraw(pageCur);
      },
      unselect: () => selectionFunctions.setSelectedRows(() => false)
    };

    const sortingFunctions = {
      showSortingIndicators: () => {
        const colId = util.colIdFromName(myOpts.sortcolname);
        const colIdx = util.colIdxFromName(myOpts.sortcolname);
        const colDef = myOpts.columns[colIdx];
        const bAsc = colDef.sortorder === 'asc';
        $(`${selGridId} thead div .sort-indicator`).text('');
        $(`${selGridId} thead #${colId} div .sort-indicator`).html(bAsc ? '&#x25B2' : '&#x25BC'); // triangle up/down
      },
      getSortState: () => {
        const colIdx = util.colIdxFromName(myOpts.sortcolname);
        const colDef = myOpts.columns[colIdx];
        const sortDefs = [...(colDef.sortmaster || myOpts.sortmaster || [])];
        if (!colDef.sortmaster || colDef.sortmaster.map((x) => x.col).indexOf(colIdx) < 0) {
          sortDefs.push({ col: colIdx, sortorder: colDef.sortorder });
        }
        return sortDefs;
      },
      sortToggle: () => {
        const sortToggleS = {
          desc: 'asc',
          asc: 'desc',
          'desc-fix': 'desc-fix',
          'asc-fix': 'asc-fix'
        };
        sortingFunctions.getSortState().forEach((o) => (myOpts.columns[o.col].sortorder = sortToggleS[myOpts.columns[o.col].sortorder] || 'asc'));
      },
      sorting: (event) => {
        // sorting
        const colid = event.currentTarget.id;
        if (!suppressSorting && colid && myOpts.flags.withSorting) {
          selectionFunctions.deselectAllRows();
          myOpts.sortcolname = util.colNameFromId(colid);
          sortingFunctions.sortToggle();
          if (myOpts.hasMoreResults && myOpts.reloadData) {
            myOpts.reloadData();
          } else {
            sortingFunctions.doSort();
            pageCur = 0;
            redraw(pageCur);
          }
        }
      },
      doSort: () => {
        if (myOpts.sortcolname) {
          sortingFunctions.showSortingIndicators();
          const colIdx = util.colIdxFromName(myOpts.sortcolname);
          const colDef = myOpts.columns[colIdx];
          const sortDefs = [...(colDef.sortmaster || myOpts.sortmaster || [])];
          if (!colDef.sortmaster || !colDef.sortmaster.map((x) => x.col).includes(colIdx)) {
            sortDefs.push({ col: colIdx, sortformat: colDef.sortformat, sortorder: colDef.sortorder });
          }
          sortDefs.forEach((o) => (o.sortorder = myOpts.columns[o.col].sortorder || 'desc'));
          tblData = tblData.sort(tblData.rowCmpCols(sortDefs, origData.groupsdata));
          util.log('sorting', myOpts.sortcolname, JSON.stringify(sortDefs));
        }
      }
    };

    const filteringFunctions = {
      getFilterValues: () =>
        $(selGridId + 'thead th input[type=text],' + selGridId + 'thead th select')
          .toArray()
          .reduce((acc, o) => (!$(o).val()?.trim() ? acc : { ...acc, [o.id]: $(o).val().trim() }), {}),
      setFilterValues: (filter, n = 0) => {
        if (Object.keys(filter).length === 0) return;
        $(selGridId + 'thead th input[type=text],' + selGridId + 'thead th select').each((idx, o) => $(o).val(filter[o.id]));
        filteringFunctions.filterData();
        pageCurMax = Math.floor(Math.max(0, tblData.length - 1) / myOpts.rowsPerPage);
        pageCur = n;
        redraw(pageCur);
      },
      filterData: () => {
        const filters = $(selGridId + 'thead th input[type=text],' + selGridId + 'thead th select')
          .toArray()
          .reduce(
            (acc, o) => {
              const val = $(o).val();
              if (val && val.trim()) {
                const colid = $(o).attr('id');
                const colname = util.colNameFromId(colid);
                const col = util.colIdxFromName(colname);
                const render = util.getRender(colname);
                const match = util.getMatch(colname);
                acc.push({ col, searchtext: val.trim(), render, match });
              }
              return acc;
            },
            [...myOpts.predefinedFilters]
          );
        tblData = mx(origData.filterGroups(myOpts.groupDefs, origData.groupsdata));
        tblData = mx(tblData.filterData(filters));
        pageCurMax = Math.floor(Math.max(0, tblData.length - 1) / myOpts.rowsPerPage);
        sortingFunctions.doSort();
      },
      filtering: (event) => {
        util.log('filtering', event);
        selectionFunctions.deselectAllRows();
        filteringFunctions.filterData();
        pageCur = 0;
        redraw(pageCur);
      }
    };

    const ctrlAddInfo = () => (myOpts.addInfo && myOpts.addInfo(myOpts)) || '';
    const configButton = () => (myOpts.flags.withConfigDialog ? `<button id='configButton' title='${util.translate('Spalten verwalten')}'>&#x2699;</button>` : '');
    const clearFilterButton = () =>
      myOpts.flags.withFilter && myOpts.flags.withClearFilterButton ? `<button id='clearFilterButton' title='${util.translate('Filter entfernen')}'>&#x26D2;</button>` : '';
    const arrangeColumnsButton = () =>
      myOpts.flags.withArrangeColumnsButton ? `<button id='arrangeColumnsButton' title='${util.translate('Spaltenbreite anpassen')}'>&hArr;</button>` : '';

    const selectLenCtrl = () => {
      if (!myOpts.flags.withPageLengthCtrl) return '';
      const options = myOpts.rowsPerPageSelectValues.reduce((acc, o) => {
        const selected = o === myOpts.rowsPerPage ? 'selected' : '';
        return acc + '<option value="' + o + '" ' + selected + '>' + o + '</option>\n';
      }, '');
      return '<select id="lenctrl">\n' + options + '</select>\n';
    };

    const pageBrowseCtrl = `
      <button class='firstBtn'>&#8676;</button>
      <button class='backBtn'>&larr;</button>
      <button class='nextBtn'>&rarr;</button>
      <button class='lastBtn'>&#8677;</button>`;

    const ctrlInfo = () => {
      const cntSel = selectionFunctions.getSelectedRows().length;
      const startRow = Math.min(myOpts.rowsPerPage * pageCur + 1, tblData.length);
      const endRow = Math.min(startRow + myOpts.rowsPerPage - 1, tblData.length);
      const filtered = origData.length === tblData.length ? '' : template(util.translate('(<%=len%> Eintr&auml;ge)'))({ len: origData.length });
      const cntSelected = !cntSel || !myOpts.selectionCol || myOpts.selectionCol.singleSelection ? '' : template(util.translate('(<%=len%> ausgew&auml;hlt)'))({ len: cntSel });
      return template(util.translate('<%=start%> bis <%=end%> von <%=count%> Zeilen <%=filtered%> <%=cntSelected%>'))({
        start: startRow,
        end: endRow,
        count: tblData.length,
        filtered: filtered,
        cntSelected: cntSelected
      });
    };

    const tableHead = () => {
      let res = myOpts.selectionCol ? '<th class="selectCol"><input id="checkAll" type="checkbox"></th>' : '';
      for (let c = 0; c < myOpts.columns.length; c++) {
        const colDef = myOpts.columns[myOpts.colorder[c]];
        if (!colDef.invisible) {
          const inputFld = '<input type="text" id="<%=id%>" value="<%=filter%>" title="<%=tooltip%>"/>';
          const selectFld = '<select id="<%=id%>"><%=opts%></select>';
          const selOptions = (colDef.valuelist || []).reduce((acc, o) => acc + `<option${o === colDef.filter ? ' selected' : ''}>${o}</option>\n`, '');
          const t = colDef.valuelist ? selectFld : inputFld;
          const fld = template(t)({
            id: colDef.id,
            tooltip: colDef.tooltip,
            filter: colDef.filter,
            opts: selOptions
          });
          const thWidth = colDef.width ? `width:${colDef.width};` : '';
          const thStyle = colDef.css || colDef.width ? ` style="${thWidth} ${colDef.css || ''}` : '';
          const hdrTemplate = `
              <th id='<%=colid%>'<%=thStyle%> title="<%=tooltip%>" tabindex=0>
                <div style='display:inline-flex'>
                  <%=colname%>
                  <span class='sort-indicator'></span>
                </div>
                <div<%=filtersVisible%>><%=fld%></div>
              </th>`;
          // &#8209; = non breakable hyphen : &#0160; = non breakable space
          res += template(hdrTemplate)({
            colname: colDef.name.replace(/-/g, '&#8209;').replace(/ /g, '&#0160;'),
            colid: colDef.id,
            fld,
            thStyle,
            tooltip: colDef.tooltip,
            filtersVisible: myOpts.flags.withFilter ? '' : ' style="display:none"'
          });
        }
      }
      return res;
    };

    const tableData = (pageNr) => {
      if (origData[0] && origData[0].length !== myOpts.columns.length) {
        util.log('Definition and Data dont match!', origData[0].length, myOpts.columns.length);
        return '';
      }

      let res = '';
      const startRow = myOpts.rowsPerPage * pageNr;
      const gc = myOpts.groupDefs;
      for (let r = startRow; r < Math.min(startRow + myOpts.rowsPerPage, tblData.length); r++) {
        const row = tblData[r];

        if (gc && row.isGroupElement && !origData.groupsdata[tblData[r][gc.groupid]].isOpen) continue;

        let cls = row.isGroupElement ? 'group' : '';
        cls = row.isGroupHeader ? 'groupheader' : cls;
        res += '<tr>';
        const checked = !!tblData[r].selected ? ' checked="checked" ' : '';
        const disabled = !!tblData[r].disabled ? ' disabled="disabled" ' : '';

        if (myOpts.selectionCol) {
          cls = cls + ' selectCol';
          if (myOpts.selectionCol.render) {
            const x = `<td class='${cls}'>${myOpts.selectionCol.render(origData, row, checked)}</td>`;
            res += x.replace('input type', 'input id="check' + r + '"' + checked + disabled + ' type');
          } else {
            res += `
              <td class='${cls}'>
                <input id='check${r}' type='${myOpts.selectionCol.singleSelection ? 'radio' : 'checkbox'}' ${checked}  ${disabled} />
              </td>`;
          }
        }

        const colorder = myOpts.colorder;
        for (let c = 0; c < myOpts.columns.length; c++) {
          const coldef = myOpts.columns[colorder[c]];
          if (!coldef.invisible) {
            const xx = tblData[r][colorder[c]];
            const v = typeof xx === 'number' ? xx : xx || '';
            const val = coldef.render ? coldef.render(v, row, r, origData) : v;
            const style = coldef.css ? ' style="' + coldef.css + '"' : '';
            res += '<td ' + cls + style + '>' + val + '</td>';
          }
        }
        res += '</tr>\n';
      }
      return res;
    };

    const ctrlsOnTop = (opts) => `
      <div class='ctrl'>
        <div id='ctrlLength'         style='float: left;'>${opts.selectLen}</div>
        <div id='ctrlConfig'         style='float: left;'>${opts.configButton}</div>
        <div id='ctrlClearFilter'    style='float: left;'>${opts.clearFilterButton}</div>
        <div id='ctrlArrangeColumns' style='float: left;'>${opts.arrangeColumnsButton}</div>
        <div id='ctrlPageAtTop'      style='float: right;'>${opts.browseBtns}</div>
      </div>`;
    const ctrlsOnBottom = (opts) => `
      <div class='ctrl'>
        <div id='ctrlInfo'           style='float: left;'>${opts.info}</div>
        <div id='ctrlAddInfo'        style='float: left;'>${opts.addInfo}</div>
        <div id='ctrlPageAtBottom'   style='float: right;'>${opts.browseBtns}</div>
      </div>`;

    const initGrid = (a) => {
      const tableTemplate = template(
        `<div class='ebtable'>
            <%=ctrlsOnTop%>
            <div id='data' style='overflow-y:auto;overflow-x:auto; max-height:<%= bodyHeight %>px; width:100%'>
              <table <%= tblClass %>>
                <thead><tr><%= head %></tr></thead>
                <tbody><%= data %></tbody>
              </table>
            </div>
            <%=ctrlsOnBottom%>
          </div>`
      );
      a.html(
        tableTemplate({
          head: tableHead(),
          data: '', //tableData(pageCur),
          bodyWidth: myOpts.bodyWidth,
          bodyHeight: myOpts.bodyHeight,
          tblClass: !myOpts.flags.colsResizable ? 'class="ebtablefix"' : '',
          ctrlsOnTop:
            myOpts.flags.withPagingCtrls || myOpts.flags.withPagingCtrlsOnTop
              ? ctrlsOnTop({
                  selectLen: selectLenCtrl(),
                  configButton: configButton(),
                  clearFilterButton: clearFilterButton(),
                  arrangeColumnsButton: arrangeColumnsButton(),
                  browseBtns: pageBrowseCtrl
                })
              : '',
          ctrlsOnBottom:
            myOpts.flags.withPagingCtrls || myOpts.flags.withPagingCtrlsOnBottom
              ? ctrlsOnBottom({
                  info: '',
                  addInfo: '',
                  browseBtns: pageBrowseCtrl
                })
              : ''
        })
      );
      filteringFunctions.filterData();
      redraw(pageCur);
    };

    // #################################################################
    // Actions
    // #################################################################

    const ignoreSorting = (event) => {
      event.target.focus();
      return false; // ignore - sorting
    };

    const initHeaderActions = () => {
      $(selGridId + 'table').on('keydown', (ev) => {
        if ($(ev.target).parent().is($('head'))) {
          console.log('in head');
        }

        if ($(ev.target).parent().is($('tbody'))) {
          const idx = $(ev.target).index();
          if (ev.which === 38) $($(selGridId + 'tbody tr').toArray()[idx - 1]).myFocus(); // arrow up
          if (ev.which === 40) $($(selGridId + 'tbody tr').toArray()[idx + 1]).myFocus(); // arrow down
        }
      });

      $(selGridId + 'thead th')
        .on('click', sortingFunctions.sorting)
        .on('keydown', (ev) => {
          if (ev.which === 32) {
            // key space
            if ($(ev.target).prop('class') === 'selectCol' || $(ev.target).prop('id') === 'checkAll') {
              $(selGridId + '#checkAll').click();
            } else {
              sortingFunctions.sorting(ev);
            }
          }
          const idx = $(ev.target).index();
          if (ev.which === 37) $($(ev.target).parent().children().toArray()[idx - 1]).myFocus(); // arrow left
          if (ev.which === 39) $($(ev.target).parent().children().toArray()[idx + 1]).myFocus(); // arrow right
          if (ev.which === 40) $(selGridId + 'tbody tr:first').myFocus(); // arrow down
        });
      $(selGridId + 'thead input[type=text]')
        .on('keypress', reloading)
        .on('keyup', filteringFunctions.filtering)
        .on('click', ignoreSorting);
      $(selGridId + 'thead select')
        .on('change', filteringFunctions.filtering)
        .on('click', ignoreSorting);
      if (myOpts.flags.colsResizable) {
        $(selGridId + '.ebtable').resizable({
          handles: 'e',
          minWidth: 150,
          stop: (evt, ui) => {
            myOpts.saveState();
            myOpts.bodyWidth = ui.size.width;
          }
        });
        $(selGridId + '.ebtable th')
          .slice(myOpts.selectionCol ? 1 : 0)
          .resizable({
            handles: 'e',
            minWidth: 20,
            stop: () => {
              suppressSorting = true;
              myOpts.saveState();
              setTimeout(() => (suppressSorting = false), 500);
            }
          });
      }
    };

    const initActions = () => {
      $(selGridId + '#lenctrl').selectmenu({
        change: (event, data) => {
          util.log('change rowsPerPage', event, data.item.value);
          myOpts.rowsPerPage = Number(data.item.value);
          pageCur = 0;
          pageCurMax = Math.floor(Math.max(0, tblData.length - 1) / myOpts.rowsPerPage);
          redraw(pageCur);
          myOpts.saveState && myOpts.saveState();
        }
      });
      $(selGridId + '#configButton')
        .button()
        .on('click', () => {
          const dlgOpts = {
            listOfColumns: myOpts.colorder.map((colIdx) => myOpts.columns[colIdx]),
            okString: util.translate('OK'),
            cancelString: util.translate('Abbrechen'),
            title: util.translate('Spalten ausblenden und sortieren'),
            anchor: '#' + gridId + ' #configButton'
          };
          dlgConfig(dlgOpts, (colDefs) => {
            console.log(colDefs);
            myOpts.colorder = colDefs.map((cd) => util.colIdxFromName(cd.id));
            colDefs.forEach((cd) => (myOpts.columns[util.colIdxFromName(cd.id)].invisible = cd.invisible));
            myOpts.saveState && myOpts?.saveState();
            redrawWithHeader(pageCur);
          });
        });
      $(selGridId + '.firstBtn')
        .button()
        .on('click', () => {
          pageCur = 0;
          redraw(pageCur);
        });
      $(selGridId + '.backBtn')
        .button()
        .on('click', () => {
          pageCur = Math.max(0, pageCur - 1);
          redraw(pageCur);
        });
      $(selGridId + '.nextBtn')
        .button()
        .on('click', () => {
          pageCur = Math.min(pageCur + 1, pageCurMax);
          redraw(pageCur);
        });
      $(selGridId + '.lastBtn')
        .button()
        .on('click', () => {
          pageCur = pageCurMax;
          redraw(pageCur);
        });
      $(selGridId + '#clearFilterButton')
        .button()
        .on('click', () => {
          $(selGridId + 'thead input[type=text]').val('');
          $(selGridId + 'thead select option:selected').prop('selected', false);
          myOpts.reloadData && myOpts.reloadData();
          filteringFunctions.filtering();
        });
      $(selGridId + 'table tbody tr td')
        .on('click', (ev) => {
          console.log('AAA');
          const row = $(ev.target).parent();
          const idx = $(row).index();
          const rowData = tblData[pageCur * myOpts.rowsPerPage + idx];
          myOpts.clickOnRowHandler && myOpts.clickOnRowHandler(rowData, $(row));
        })
        .on('keydown', (ev) => {
          const row = $(ev.target).parent();
          if (ev.which === 38) $(selGridId + 'tbody tr:nth.child(' + $(row).index() - 1 + ')').myFocus(); // arrow up
          if (ev.which === 40) $(selGridId + 'tbody tr:nth.child(' + $(row).index() + 1 + ')').myFocus(); // arrow down
        });
      $(selGridId + '#data input[type=checkbox]', selGridId + '#data input[type=radio]').on('change', selectionFunctions.selectRows);
      $(selGridId + '#arrangeColumnsButton')
        .button()
        .on('click', util.setDefaultWidthForColumns);

      initHeaderActions();
    };

    // ##############################################################################

    const defOpts = {
      columns: [],
      flags: {
        withFilter: true,
        withSorting: true,
        withConfigDialog: true,
        withPageLengthCtrl: true,
        withClearFilterButton: false,
        withArrangeColumnsButton: true,
        withPagingCtrls: true,
        colsResizable: true,
        tableResizable: true,
        jqueryuiTooltips: true
      },
      bodyHeight: Math.max(200, $(window).height() - 180),
      bodyWidth: '', //Math.max(700, $(window).width() - 40),
      rowsPerPageSelectValues: [5, 10, 25, 50, 100],
      rowsPerPage: 5,
      pageCur: 0,
      colorder: range(opts.columns.length), // [0,1,2,... ]
      selectionCol: false, // or true or
      // {
      //   singleSelection: true,                             // default: false
      //   selectOnRowClick: true,                            // default: false
      //   render : (origData, row, checked) => {},           // default: null
      //   onStartSelection: (rowNr, row, origData, b) => {}, // default: null
      //   onSelection: (rowNr, row, origData, b) => {},      // default: null
      //   onSelectAll: () => {}                              // default: null
      //   onUnselectAll: () => {}                            // default: null
      // }
      saveState: stateUtil.saveState,
      loadState: stateUtil.loadState,
      getState: stateUtil.getState,
      sortmaster: [], // [{ col:1, sortorder:asc, sortformat:fct1 },{ col:2, sortorder:asc-fix }]
      groupDefs: {}, // { grouplabel: 0, groupcnt: 1, groupid: 2, groupsortstring: 3, groupname: 4, grouphead: 'GA', groupelem: 'GB' },
      openGroups: [],
      hasMoreResults: hasMoreResults,
      clickOnRowHandler: (rowData, row) => util.log('clickOnRowHandler', rowData, row), // just for documentation
      lang: 'de',
      afterRedraw: null,
      predefinedFilters: []
    };

    {
      // trimming opts param
      opts.flags = { ...defOpts.flags, ...opts.flags };
      if (opts.flags.colsResizable) opts.saveState = defOpts.saveState;
      opts.saveState = typeof opts.saveState === 'boolean' ? stateUtil.saveState : opts.saveState;
      opts.columns = opts.columns.map((colDef) => ({
        technical: false,
        invisible: false,
        mandatory: false,
        sortorder: 'asc',
        ...colDef
      }));
    }

    const gridId = this[0].id;
    const self = this;
    const selGridId = '#' + gridId + ' ';
    const localStorageKey = 'ebtable-' + docTitle + '-' + gridId + '-v1.0';
    const myOpts = { ...defOpts, ...opts, localStorageKey };

    let origData = mx(data, myOpts.groupDefs);
    let tblData = origData;
    let pageCurMax = Math.floor(Math.max(0, origData.length - 1) / myOpts.rowsPerPage);
    let pageCur = Math.min(Math.max(0, myOpts.pageCur), pageCurMax);

    checkConfig(myOpts, origData);

    if (myOpts.saveState && myOpts.getState) {
      myOpts.loadState(myOpts.getState());
    }

    myOpts.columns = myOpts.columns.map((c) => ({ ...c, id: c.name.replace(/[^\w]/g, '') }));

    initGrid(this);
    initActions();

    myOpts.flags.jqueryuiTooltips && self.tooltip();

    // ##########  Exports ############
    self.util = util;
    $.extend(self, {
      getFilterValues: filteringFunctions.getFilterValues,
      setFilterValues: filteringFunctions.setFilterValues,
      iterateSelectedValues: selectionFunctions.iterateSelectedValues,
      getSelectedRows: selectionFunctions.getSelectedRows,
      setSelectedRows: selectionFunctions.setSelectedRows,
      unselect: selectionFunctions.unselect,
      saveSessionState,
      redrawAddInfo,
      toggleGroupIsOpen: (groupId) => {
        origData.groupsdata[groupId].isOpen = !origData.groupsdata[groupId].isOpen;
        filteringFunctions.filterData();
        pageCur = Math.min(pageCur, pageCurMax);
        redraw(pageCur);
      },
      groupIsOpen: (groupId) => origData.groupsdata[groupId].isOpen,
      getPageCur: () => pageCur
    });

    if (myOpts.openGroups && myOpts.openGroups.length) {
      myOpts.loadGroupContent && myOpts.loadGroupContent(myOpts.openGroups, self);
      myOpts.openGroups.forEach((groupid) => {
        const groupsData = origData.groupsdata;
        if (groupsData && groupsData[groupid]) {
          groupsData[groupid].isOpen = true;
        }
      });
      filteringFunctions.filterData();
      redraw(pageCur);
    }

    return this;
  };

  // ##########  language ############
  $.fn.ebtable.lang = {
    de: {},
    en: {
      '(<%=len%> ausgew&auml;hlt)': '(<%=len%> selected)',
      '(<%=len%> Eintr&auml;ge)': '(<%=len%> entries)',
      '<%=start%> bis <%=end%> von <%=count%> Zeilen <%=filtered%> <%=cntSelected%>': '<%=start%> to <%=end%> of <%=count%> shown entries <%= filtered %> <%=cntSelected%>',
      'Spalten verwalten': 'Configure Columns',
      'Filter entfernen': 'Remove all filters',
      'Spaltenbreite anpassen': 'Adjust width of columns',
      'Spalten ausblenden und umsortieren': 'Reorder and hide columns',
      OK: 'OK',
      Abbrechen: 'Cancel'
    }
  };

  // ##########  sessionState  ############
  $.fn.ebtable.loadSessionState = () => JSON.parse(sessionStorage[sessionStorageKey] || '{}');
  $.fn.ebtable.removeSessionState = () => delete sessionStorage[sessionStorageKey];
})(jQuery);
