const range = (n) => [...Array(n).keys()];
const dlgConfig = (opts) => {
  const dlgTemplate = _.template(
    `<div id="<%=gridId%>configDlg" class='configDlg'>
        <ol id="<%=gridId%>selectable" class="ebtableSelectable">
          <%=listOfColumnNames%>
        </ol>
    </div>`
  )(opts);

  const dlgOpts = {
    open: () => {
      $('ol#' + opts.gridId + 'selectable').sortable();
      $('#' + opts.gridId + 'configDlg li')
        .off('click')
        .on('click', (event) => {
          $('#' + opts.gridId + 'configDlg [id="' + event.target.id + '"]')
            .toggleClass('invisible')
            .toggleClass('visible');
        });
    },
    title: opts.title,
    position: { my: 'left top', at: 'left bottom', of: opts.anchor },
    width: '250px',
    modal: true,
    buttons: {}
  };
  dlgOpts.buttons[opts.okString] = function () {
    opts.callBack();
    $(this).dialog('destroy');
  };
  dlgOpts.buttons[opts.cancelString] = function () {
    $(this).dialog('destroy');
  };

  $(dlgTemplate).dialog(dlgOpts);
};

(function ($) {
  const docTitle = $(document).prop('title').replace(/ /g, '');
  const sessionStorageKey = 'ebtable-' + docTitle + '-v1.0';
  let suppressSorting = false;

  //###########################################################################################################

  $.fn.ebtable = function (opts, data, hasMoreResults) {
    const stateUtil = {
      // saving/loading state
      getStateAsJSON: function () {
        const stateGeneral = {
          rowsPerPage: myOpts.rowsPerPage,
          colorderByName: myOpts.colorder.map((idx) => myOpts.columns[idx].name),
          invisibleColnames: myOpts.columns.reduce((acc, o) => (o.invisible && !o.technical ? [...acc, o.name] : acc), [])
        };
        const stateWidth = myOpts.flags.colsResizable
          ? {
              colwidths: util.getColWidths()
            }
          : {};
        const state = { ...stateGeneral, ...stateWidth };
        return JSON.stringify(state);
      },
      saveState: function saveState() {
        localStorage[localStorageKey] = stateUtil.getStateAsJSON();
      },
      getState: function getState() {
        return localStorage[localStorageKey] ? JSON.parse(localStorage[localStorageKey]) : null;
      },
      loadState: function loadState(state) {
        if (!state) {
          util.setDefaultWidthForColumns();
          return;
        }
        myOpts.rowsPerPage = state.rowsPerPage;
        const x1 = state.colorderByName.map((n) => util.colIdxFromName(n)).filter((n) => n >= 0);
        const x2 = myOpts.columns.map((_, idx) => idx);
        myOpts.colorder = Array.from(new Set([...x1, ...x2]));
        if (myOpts.flags.colsResizable) {
          myOpts.bodyWidth = state.bodyWidth;
          state.colwidths &&
            Array.isArray(state.colwidths) &&
            state.colwidths.forEach(function (col) {
              const coldef = util.colDefFromName(col.name);
              if (coldef) {
                coldef.width = col.width + 'px';
              }
            });
        }
        state.invisibleColnames.forEach(function (colname) {
          const n = util.colIdxFromName(colname);
          if (n >= 0) {
            myOpts.columns[n].invisible = true;
          }
        });
      }
    };

    const sessionStateUtil = (() => {
      // saving/loading state
      const saveSessionState = () => {
        const openGroups = getOpenGroups();
        sessionStorage[sessionStorageKey] = JSON.stringify({
          pageCur: self.getPageCur(),
          filters: filteringFcts.getFilterValues(),
          myopts: $.extend({}, myOpts, { openGroups: openGroups })
        });
      };
      return {
        // api
        saveSessionState: saveSessionState
      };
    })();

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
        const matcher = util.colDefFromName(colname).match;
        return matcher ? (typeof matcher === 'string' ? mx.matcher[matcher] : matcher) : mx.matcher['starts-with-matches'];
      },
      checkConfig: (myopts, origData) => {
        myopts.columns.forEach((coldef) => {
          // set reasonable defaults for coldefs
          coldef.technical = coldef.technical || false;
          coldef.invisible = coldef.invisible || false;
          coldef.mandatory = coldef.mandatory || false;
          coldef.sortorder = coldef.sortorder || 'asc';
        });
        if (origData[0] && origData[0].length !== myopts.columns.length) {
          alert("Data definition and column definition don't match! " + origData[0].length + ' ' + myopts.columns.length);
          localStorage[localStorageKey] = '';
          myopts = { ...defOpts, ...opts };
        }
        const ls = localStorage[localStorageKey];
        if (ls && ls.colorder && ls.colorder.length !== myopts.columns.length) {
          alert("Column definition and LocalStorage don't match!" + ls.colorder.length + ' ' + myopts.columns.length);
          localStorage[localStorageKey] = '';
          myopts = $.extend({}, defOpts, opts);
        }
        myopts.columns.forEach((col) => {
          if (col.technical && !col.invisible) alert(col.name + ': technical column must be invisible!');
          if (col.mandatory && col.invisible) alert(col.name + ': mandatory column must be visible!');
        });
      },
      getColWidths: () =>
        $(selGridId + '.ebtable th')
          .toArray()
          .map((o) => {
            const id = $(o).prop('id');
            const w = Math.max(20, $(o).width());
            const name = util.colNameFromId(id);
            util.log($(o).prop('id'), w, name);
            return { name: name, width: w };
          })
          .filter((o) => o.name),
      setDefaultWidthForColumns: () => {
        if (myOpts.flags.colsResizable) {
          $(selGridId + '#data table').removeClass('ebtablefix');
          $(selGridId + '#data table th').removeAttr('style');
          const colWidths = util.getColWidths();
          colWidths &&
            colWidths.forEach(function (o) {
              const id = util.colIdFromName(o.name);
              $(selGridId + 'table th#' + id).width(o.width);
            });
          $(selGridId + '#data table').addClass('ebtablefix');
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

    const redraw = (pageCur, withHeader) => {
      if (withHeader) {
        $(selGridId + 'thead tr').html(tableHead());
        initHeaderActions();
      }
      const addInfo = ctrlAddInfo();
      $(selGridId + '.ebtable').width(myOpts.bodyWidth);
      $(selGridId + '#ctrlInfo').html(ctrlInfo());
      $(selGridId + '#ctrlAddInfo')
        .toggle(!!addInfo)
        .html(addInfo);
      $(selGridId + '#data tbody').html(tableData(pageCur));
      $(selGridId + '#data input[type=checkbox]')
        .off()
        .on('change', selectionFcts.selectRows);
      $(selGridId + '#data input[type=radio]')
        .off()
        .on('change', selectionFcts.selectRows);
      myOpts.selectionCol &&
        myOpts.selectionCol.selectOnRowClick &&
        $(selGridId + '#data tr td:not(:first-child)')
          .off()
          .on('click', function () {
            $(event.target).parent().find('input').trigger('click');
          });
      myOpts.selectionCol && myOpts.selectionCol.singleSelection && $(selGridId + '#checkAll').hide();
      myOpts.afterRedraw && myOpts.afterRedraw($(gridId));
    };

    const selectionFcts = {
      selectRow: (rowNr, row, b) => {
        // b = true/false ~ on/off
        if (!row || row.disabled) return;

        myOpts.selectionCol.onStartSelection && myOpts.selectionCol.onStartSelection(rowNr, row, origData, b);

        row.selected = b;
        const gc = myOpts.groupdefs;
        const groupid = row[gc.groupid];
        if (gc && groupid && row[gc.grouplabel] === gc.grouphead) {
          util.log('Groupheader ' + (b ? 'selected!' : 'unselected!'), groupid, row[gc.grouplabel]);
          origData.getGroupRows(gc, groupid).forEach(function (o) {
            o.selected = b;
          });
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
            tblData.forEach((row, rowNr) => selectionFcts.selectRow(rowNr, tblData[rowNr], checked));
          } else {
            selectionFcts.deselectAllRows();
          }
        } else {
          if (myOpts.selectionCol && myOpts.selectionCol.singleSelection) {
            tblData.forEach(function (row, rowNr) {
              if (row.selected) selectionFcts.selectRow(rowNr, row, false);
            });
          }
          const rowNr = event.target.id.replace('check', '');
          selectionFcts.selectRow(rowNr, tblData[rowNr], checked);
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
              selectionFcts.selectRow(rowNr, row, false);
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
      unselect: () => selectionFcts.setSelectedRows(() => false)
    };

    const sortingFcts = {
      showSortingIndicators: () => {
        const colid = util.colIdFromName(myOpts.sortcolname);
        const colidx = util.colIdxFromName(myOpts.sortcolname);
        const coldef = myOpts.columns[colidx];
        const bAsc = coldef.sortorder === 'asc';
        $(`${selGridId} thead div .sort-indicator`).text('');
        $(`${selGridId} thead #${colid} div .sort-indicator`).html(bAsc ? '&#x25B2;' : '&#x25BC;');
      },
      getSortState: () => {
        const colidx = util.colIdxFromName(myOpts.sortcolname);
        const coldef = myOpts.columns[colidx];
        const sortDefs = $.extend([], coldef.sortmaster || myOpts.sortmaster);
        if (!coldef.sortmaster || coldef.sortmaster.map((x) => x.col).indexOf(colidx) < 0) {
          sortDefs.push({ col: colidx, sortorder: coldef.sortorder });
        }
        return sortDefs;
      },
      sortToggle: () => {
        const sortToggleS = { desc: 'asc', asc: 'desc', 'desc-fix': 'desc-fix', 'asc-fix': 'asc-fix' };
        sortingFcts.getSortState().forEach((o) => (myOpts.columns[o.col].sortorder = sortToggleS[myOpts.columns[o.col].sortorder] || 'asc'));
      },
      sorting: (event) => {
        // sorting
        const colid = event.currentTarget.id;
        if (!suppressSorting && colid && myOpts.flags.withsorting) {
          selectionFcts.deselectAllRows();
          myOpts.sortcolname = util.colNameFromId(colid);
          sortingFcts.sortToggle();
          if (myOpts.hasMoreResults && myOpts.reloadData) {
            myOpts.reloadData();
          } else {
            sortingFcts.doSort();
            pageCur = 0;
            redraw(pageCur);
          }
        }
      },
      doSort: () => {
        if (myOpts.sortcolname) {
          sortingFcts.showSortingIndicators();
          const colidx = util.colIdxFromName(myOpts.sortcolname);
          const coldef = myOpts.columns[colidx];
          const sortDefs = $.extend([], coldef.sortmaster || myOpts.sortmaster);
          if (!coldef.sortmaster || coldef.sortmaster.map((x) => x.col).indexOf(colidx) < 0) {
            sortDefs.push({ col: colidx, sortformat: coldef.sortformat, sortorder: coldef.sortorder });
          }
          sortDefs.forEach((o) => (o.sortorder = myOpts.columns[o.col].sortorder || 'desc'));
          tblData = tblData.sort(tblData.rowCmpCols(sortDefs, origData.groupsdata));
          util.log('sorting', myOpts.sortcolname, JSON.stringify(sortDefs));
        }
      }
    };

    const filteringFcts = {
      getFilterValues: () => {
        const filter = {};
        $(selGridId + 'thead th input[type=text],' + selGridId + 'thead th select').each((idx, o) => {
          if ($.trim($(o).val())) filter[o.id] = $(o).val().trim();
        });
        return filter;
      },
      setFilterValues: (filter, n = 0) => {
        if (Object.keys(filter).length === 0) return;
        $(selGridId + 'thead th input[type=text],' + selGridId + 'thead th select').each((idx, o) => $(o).val(filter[o.id]));
        filteringFcts.filterData();
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
                const ren = util.getRender(colname);
                const mat = util.getMatch(colname);
                acc.push({ col: col, searchtext: val.trim(), render: ren, match: mat });
              }
              return acc;
            },
            [...myOpts.predefinedFilters]
          );
        tblData = mx(origData.filterGroups(myOpts.groupdefs, origData.groupsdata));
        tblData = mx(tblData.filterData(filters));
        pageCurMax = Math.floor(Math.max(0, tblData.length - 1) / myOpts.rowsPerPage);
        sortingFcts.doSort();
      },
      filtering: (event) => {
        util.log('filtering', event);
        selectionFcts.deselectAllRows();
        filteringFcts.filterData();
        pageCur = 0;
        redraw(pageCur);
      }
    };

    const ctrlAddInfo = () => (myOpts.addInfo && myOpts.addInfo(myOpts)) || '';
    const configButton = () => (myOpts.flags.config ? '<button id="configButton">' + util.translate('Spalten verwalten') + ' <span class="ui-icon ui-icon-shuffle"></button>' : '');
    const clearFilterButton = () =>
      myOpts.flags.filter && myOpts.flags.clearFilterButton
        ? '<button id="clearFilterButton"><span class="ui-icon ui-icon-minus" title="' + util.translate('Alle Filter entfernen') + '"></button>'
        : '';
    const arrangeColumnsButton = () =>
      myOpts.flags.arrangeColumnsButton
        ? '<button id="arrangeColumnsButton"><span class="ui-icon ui-icon-arrow-2-e-w" title="' + util.translate('Spaltenbreite automatisch abpassen') + '"></button>'
        : '';

    const selectLenCtrl = () => {
      if (!myOpts.flags.pagelenctrl) return '';
      const options = myOpts.rowsPerPageSelectValues.reduce((acc, o) => {
        const selected = o === myOpts.rowsPerPage ? 'selected' : '';
        return acc + '<option value="' + o + '" ' + selected + '>' + o + '</option>\n';
      }, '');
      return '<select id="lenctrl">\n' + options + '</select>\n';
    };

    const pageBrowseCtrl = `
            <button class='firstBtn'><span class='ui-icon ui-icon-seek-first'/></button>
            <button class='backBtn'><span  class='ui-icon ui-icon-seek-prev' /></button>
            <button class='nextBtn'><span  class='ui-icon ui-icon-seek-next' /></button>
            <button class='lastBtn'><span  class='ui-icon ui-icon-seek-end'  /></button>`;

    const ctrlInfo = () => {
      const cntSel = selectionFcts.getSelectedRows().length;
      const startRow = Math.min(myOpts.rowsPerPage * pageCur + 1, tblData.length);
      const endRow = Math.min(startRow + myOpts.rowsPerPage - 1, tblData.length);
      const filtered = origData.length === tblData.length ? '' : _.template(util.translate('(<%=len%> Eintr\u00e4ge)'))({ len: origData.length });
      const cntSelected = !cntSel || !myOpts.selectionCol || myOpts.selectionCol.singleSelection ? '' : _.template(util.translate('(<%=len%> ausgew\u00e4hlt)'))({ len: cntSel });
      const template = _.template(util.translate('<%=start%> bis <%=end%> von <%=count%> Zeilen <%=filtered%> <%=cntSelected%>'));
      return template({
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
        const coldef = myOpts.columns[myOpts.colorder[c]];
        if (!coldef.invisible) {
          const t_inputfld = '<input type="text" id="<%=colid%>" value="<%=filter%> " title="<%=tooltip%>"/>';
          const t_selectfld = '<select id="<%=colid%>" value="<%=filter%>"><%=opts%></select>';
          const selOptions = (coldef.valuelist || []).reduce((acc, o) => acc + '<option>' + o + '</option>\n', '');
          const t = coldef.valuelist ? t_selectfld : t_inputfld;
          const fld = _.template(t)({
            colid: coldef.id,
            opts: selOptions,
            tooltip: coldef.tooltip,
            filter: coldef.filter
          });
          const thwidth = coldef.width ? `width:${coldef.width};` : '';
          const thstyle = coldef.css || coldef.width ? ` style="${thwidth} ${coldef.css || ''}` : '';
          const hdrTemplate = `
              <th id="<%=colid%>"<%=thstyle%> title="<%=tooltip%>" >
                <div style="display:inline-flex">
                  <%=colname%>
                  <span class="sort-indicator"></span>
                </div>
                <div<%=filtersvisible%>><%=fld%></div>
              </th>`;
          // &#8209; = non breakable hyphen : &#0160; = non breakable space
          res += _.template(hdrTemplate)({
            colname: coldef.name.replace(/-/g, '&#8209;').replace(/ /g, '&#0160;'),
            colid: coldef.id,
            fld: fld,
            thstyle: thstyle,
            tooltip: coldef.tooltip,
            filtersvisible: myOpts.flags.filter ? '' : ' style="display:none"'
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
      const gc = myOpts.groupdefs;
      for (let r = startRow; r < Math.min(startRow + myOpts.rowsPerPage, tblData.length); r++) {
        const row = tblData[r];

        if (gc && row.isGroupElement && !origData.groupsdata[tblData[r][gc.groupid]].isOpen) continue;

        let cls = row.isGroupElement ? ' class="group"' : '';
        cls = row.isGroupHeader ? ' class="groupheader"' : cls;
        res += '<tr>';
        const checked = !!tblData[r].selected ? ' checked="checked" ' : '';
        const disabled = !!tblData[r].disabled ? ' disabled="disabled" ' : '';

        if (myOpts.selectionCol) {
          if (myOpts.selectionCol.render) {
            const x = '<td' + cls + '>' + myOpts.selectionCol.render(origData, row, checked) + '</td>';
            res += x.replace('input type', 'input id="check' + r + '"' + checked + disabled + ' type');
          } else if (myOpts.selectionCol.singleSelection) {
            res += '<td' + cls + '><input id="check' + r + '" type="radio"' + checked + disabled + '/></td>';
          } else if (!myOpts.selectionCol.singleSelection) {
            res += '<td' + cls + '><input id="check' + r + '" type="checkbox"' + checked + disabled + '/></td>';
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

    const initGrid = (a) => {
      const tableTemplate = _.template(
        `<div class='ebtable'>
            <div class='ctrl' <%=ctrlStyle%>>
              <div id='ctrlLength'         style='float: left;'><%= selectLen  %></div>
              <div id='ctrlConfig'         style='float: left;'><%= configButton %></div>
              <div id='ctrlClearFilter'    style='float: left;'><%= clearFilterButton %></div>
              <div id='ctrlArrangeColumns' style='float: left;'><%= arrangeColumnsButton %></div>
              <div id='ctrlPage1'          style='float: right;'><%= browseBtns %></div>
            </div>
            <div id='data' style='overflow-y:auto;overflow-x:auto; max-height:<%= bodyHeight %>px; width:100%'>
              <table <%= tblClass %>>
                <thead><tr><%= head %></tr></thead>
                <tbody><%= data %></tbody>
              </table>
            </div>
            <div class='ctrl' <%=ctrlStyle%>>
              <div id='ctrlInfo'    style='float: left;' class='ui-widget-content'><%= info %></div>
              <div id='ctrlAddInfo' style='float: left;' class='ui-widget-content'><%= addInfo %></div>
              <div id='ctrlPage2'   style='float: right;' ><%= browseBtns %></div>
            </div>
          </div>`
      );
      a.html(
        tableTemplate({
          head: tableHead(),
          data: '', //tableData(pageCur),
          selectLen: selectLenCtrl(),
          configButton: configButton(),
          clearFilterButton: clearFilterButton(),
          arrangeColumnsButton: arrangeColumnsButton(),
          browseBtns: pageBrowseCtrl,
          info: '', //ctrlInfo TODO ???
          addInfo: '', //ctrlAddInfo(), TODO ???
          ctrlStyle: myOpts.flags.ctrls ? '' : 'style="display:none"',
          bodyWidth: myOpts.bodyWidth,
          bodyHeight: myOpts.bodyHeight,
          tblClass: myOpts.flags.colsResizable ? 'class="ebtablefix"' : ''
        })
      );
      filteringFcts.filterData();
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
      $(selGridId + 'thead th')
        .off()
        .on('click', sortingFcts.sorting);
      $(selGridId + 'thead input[type=text]')
        .off()
        .on('keypress', reloading)
        .on('keyup', filteringFcts.filtering)
        .on('click', ignoreSorting);
      $(selGridId + 'thead select')
        .off()
        .on('change', filteringFcts.filtering)
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
        .off()
        .on('click', () => {
          const listOfColumnNames = myOpts.colorder.reduce((acc, idx) => {
            const t = _.template('<li id="<%=name%>" class="ui-widget-content <%=cls%>"><%=name%></li>');
            const colDef = myOpts.columns[idx];
            return (
              acc +
              (colDef.technical || colDef.mandatory
                ? ''
                : t({
                    name: colDef.name,
                    cls: colDef.invisible ? 'invisible' : 'visible'
                  }))
            );
          }, '');
          const dlgOpts = {
            listOfColumnNames: listOfColumnNames,
            gridId,
            okString: util.translate('OK'),
            cancelString: util.translate('Abbrechen'),
            title: util.translate('Spalten ausblenden und sortieren'),
            anchor: '#' + gridId + ' #configButton',
            callBack: function () {
              $('#' + gridId + 'configDlg li.visible').each((idx, o) => {
                myOpts.columns[util.colIdxFromName($(o).prop('id'))].invisible = false;
              });
              $('#' + gridId + 'configDlg li.invisible').each((idx, o) => {
                myOpts.columns[util.colIdxFromName($(o).prop('id'))].invisible = true;
              });
              const colNames = [];
              $('#' + gridId + 'configDlg li').each((idx, o) => colNames.push($(o).prop('id')));
              myOpts.colorder = myOpts.columns.map((col, idx) => (col.technical || col.mandatory ? idx : util.colIdxFromName(colNames.shift())));
              myOpts.saveState && myOpts.saveState();
              myOpts.bodyWidth = Math.min(myOpts.bodyWidth || $(window).width() - 20, $(window).width() - 20);
              redraw(pageCur, true);
            }
          };
          dlgConfig(dlgOpts);
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
        .off()
        .on('click', () => {
          $(selGridId + 'thead input[type=text]').val('');
          myOpts.reloadData && myOpts.reloadData();
          filteringFcts.filtering();
        });
      $(selGridId + ' table tbody tr td')
        .off()
        .on('click', () => {
          // TODO -> does not work!!!
          const idx = $(this).index();
          const rowData = tblData[pageCur * myOpts.rowsPerPage + idx];
          myOpts.clickOnRowHandler && myOpts.clickOnRowHandler(rowData, $(this));
        });
      $(selGridId + '#data input[type=checkbox]', selGridId + '#data input[type=radio]')
        .off()
        .on('change', selectionFcts.selectRows);
      $(selGridId + '#arrangeColumnsButton')
        .button()
        .off()
        .on('click', util.setDefaultWidthForColumns);

      initHeaderActions();
    };

    // ##############################################################################

    const defOpts = {
      columns: [],
      flags: {
        filter: true,
        pagelenctrl: true,
        config: true,
        withsorting: true,
        clearFilterButton: false,
        arrangeColumnsButton: true,
        colsResizable: true,
        jqueryuiTooltips: true,
        ctrls: true
      },
      bodyHeight: Math.max(200, $(window).height() - 180),
      bodyWidth: '', //Math.max(700, $(window).width() - 40),
      rowsPerPageSelectValues: [5, 10, 25, 50, 100],
      rowsPerPage: 5,
      pageCur: 0,
      colorder: range(opts.columns.length), // [0,1,2,... ]
      selectionCol: false, // or true or
      // {
      //   singleSelection: true,                                 // default: false
      //   selectOnRowClick: true,                                // default: false
      //   render : (origData, row, checked) => {},           // default: null
      //   onStartSelection: (rowNr, row, origData, b) => {}, // default: null
      //   onSelection: (rowNr, row, origData, b) => {},      // default: null
      //   onSelectAll: () => {}                              // default: null
      //   onSelectAll: () => {}                              // default: null
      // }

      saveState: stateUtil.saveState,
      loadState: stateUtil.loadState,
      getState: stateUtil.getState,
      sortmaster: [], // [{ col:1, sortorder:asc, sortformat:fct1 },{ col:2, sortorder:asc-fix }]
      groupdefs: {}, // { grouplabel: 0, groupcnt: 1, groupid: 2, groupsortstring: 3, groupname: 4, grouphead: 'GA', groupelem: 'GB' },
      openGroups: [],
      hasMoreResults: hasMoreResults,
      clickOnRowHandler: (rowData, row) => {
        // just for documentation
        util.log('clickOnRowHandler', rowData, row);
      },
      lang: 'de',
      afterRedraw: null,
      predefinedFilters: []
    };

    {
      // trimming opts param
      opts.flags = { ...defOpts.flags, ...opts.flags };
      if (opts.flags.colsResizable) opts.saveState = defOpts.saveState;
      opts.saveState = typeof opts.saveState === 'boolean' ? stateUtil.saveState : opts.saveState;
    }

    const gridId = this[0].id;
    const self = this;
    const selGridId = '#' + gridId + ' ';
    const localStorageKey = 'ebtable-' + docTitle + '-' + gridId + '-v1.0';
    const myOpts = { ...defOpts, ...opts };

    let origData = mx(data, myOpts.groupdefs);
    let tblData = origData;
    let pageCurMax = Math.floor(Math.max(0, origData.length - 1) / myOpts.rowsPerPage);
    let pageCur = Math.min(Math.max(0, myOpts.pageCur), pageCurMax);

    util.checkConfig(myOpts, origData);

    if (myOpts.saveState && myOpts.getState) {
      myOpts.loadState(myOpts.getState());
    }

    myOpts.columns.forEach((coldef) => (coldef.id = coldef.name.replace(/[^\w]/g, '')));

    initGrid(this);
    initActions();

    myOpts.flags.jqueryuiTooltips && self.tooltip();

    const getOpenGroups = () => Object.keys(origData.groupsdata || []).reduce((acc, key) => (origData.groupsdata[key].isOpen ? [...acc, parseInt(key)] : acc), []);

    // ##########  Exports ############
    self.util = util;
    $.extend(self, {
      getFilterValues: filteringFcts.getFilterValues,
      setFilterValues: filteringFcts.setFilterValues,
      iterateSelectedValues: selectionFcts.iterateSelectedValues,
      getSelectedRows: selectionFcts.getSelectedRows,
      setSelectedRows: selectionFcts.setSelectedRows,
      unselect: selectionFcts.unselect,
      saveSessionState: sessionStateUtil.saveSessionState,
      redrawAddInfo: redrawAddInfo,

      toggleGroupIsOpen: (groupid) => {
        origData.groupsdata[groupid].isOpen = !origData.groupsdata[groupid].isOpen;
        filteringFcts.filterData();
        pageCur = Math.min(pageCur, pageCurMax);
        redraw(pageCur);
      },
      groupIsOpen: (groupid) => origData.groupsdata[groupid].isOpen,
      setSortColname: (colname) => (myOpts.sortcolname = colname),
      getSortColname: () => myOpts.sortcolname,
      getPageCur: () => pageCur,
      getData: () => origData,
      setData: (data) => {
        origData = mx(data, myOpts.groupdefs);
        tblData = origData;
        pageCurMax = Math.floor(Math.max(0, origData.length - 1) / myOpts.rowsPerPage);
        pageCur = Math.min(pageCur, pageCurMax);
        filteringFcts.filterData();
        redraw(pageCur);
      }
    });

    if (myOpts.openGroups && myOpts.openGroups.length) {
      myOpts.loadGroupContent && myOpts.loadGroupContent(myOpts.openGroups, self);
      myOpts.openGroups.forEach((groupid) => {
        const groupsdata = origData.groupsdata;
        if (groupsdata && groupsdata[groupid]) {
          groupsdata[groupid].isOpen = true;
        }
      });
      filteringFcts.filterData();
      redraw(pageCur);
    }

    return this;
  };

  // ##########  langs ############
  $.fn.ebtable.lang = {
    de: {},
    en: {
      '(<%=len%> ausgew\u00e4hlt)': '(<%=len%> selected)',
      '(<%=len%> Eintr\u00e4ge)': '(<%=len%> entries)',
      '<%=start%> bis <%=end%> von <%=count%> Zeilen <%=filtered%> <%=cntSelected%>': '<%=start%> to <%=end%> of <%=count%> shown entries <%= filtered %> <%=cntSelected%>',
      'Spalten verwalten': 'Configure Columns',
      'Alle Filter entfernen': 'Remove all filters',
      'Spalten ausblenden und sortieren': 'Sort and hide columns',
      OK: 'OK',
      Abbrechen: 'Cancel'
    }
  };

  // ##########  sessionState  ############
  $.fn.ebtable.loadSessionState = () => JSON.parse(sessionStorage[sessionStorageKey] || '{}');
  $.fn.ebtable.removeSessionState = () => delete sessionStorage[sessionStorageKey];
})(jQuery);
