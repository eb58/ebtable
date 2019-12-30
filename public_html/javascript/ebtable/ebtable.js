/* global _,jQuery,mx *//* jshint multistr: true */ /* jshint expr: true */
(function ($) {
  "use strict";
  const range = n => [...Array(n).keys()];

  const doctitle = $(document).prop('title').replace(/ /g, '');
  const sessionStorageKey = 'ebtable-' + doctitle + '-v1.0';
  let suppressSorting = false;

  const dlgConfig = function (opts) {
    const dlgtempl = _.template('\
        <div id="<%=gridid%>configDlg">\n\
          <ol id="<%=gridid%>selectable" class="ebtableSelectable"> \n\
            <%= listOfColumnNames %> \n\
          </ol>\n\
        </div>')({listOfColumnNames: opts.listOfColumnNames, gridid: opts.gridid});

    const dlgopts = {
      open: () => {
        $('ol#' + opts.gridid + 'selectable').sortable();
        $('#' + opts.gridid + 'configDlg li').off('click').on('click', event => {
          $('#' + opts.gridid + 'configDlg [id="' + event.target.id + '"]').toggleClass('invisible').toggleClass('visible');
        });
      },
      position: {my: "left top", at: "left bottom", of: opts.anchor},
      width: 250,
      modal: true,
      buttons: {}
    };
    dlgopts.buttons['OK'] = function () {
      opts.callBack();
      $(this).dialog("destroy");
    };
    dlgopts.buttons[opts.cancelstring] = function () {
      $(this).dialog("destroy");
    };

    $(dlgtempl).dialog(dlgopts).parent().find('.ui-widget-header').hide();
  };

  //###########################################################################################################

  $.fn.ebtable = function (opts, data, hasMoreResults) {

    const stateUtil = {// saving/loading state
      getStateAsJSON: () => {
        const stateGeneral = {
          rowsPerPage: myopts.rowsPerPage,
          colorderByName: myopts.colorder.map(idx => myopts.columns[idx] ? myopts.columns[idx].name : null),
          invisibleColnames: myopts.columns.reduce((acc, o) => {
            if (o.invisible && !o.technical)
              acc.push(o.name);
            return acc;
          }, [])
        };
        const stateWidth = {
          colwidths: util.getColWidths()
        };
        const state = _.extend({}, stateGeneral, myopts.flags.colsResizable ? stateWidth : {});
        return JSON.stringify(state);
      },
      saveState: () => localStorage[localStorageKey] = stateUtil.getStateAsJSON(),
      getState: () => localStorage[localStorageKey] ? JSON.parse(localStorage[localStorageKey]) : null,
      loadState: state => {
        if (!state) {
          util.setDefaultWidthForColumns();
          return;
        }
        myopts.rowsPerPage = state.rowsPerPage;
        myopts.colorder = [];
        state.colorderByName.forEach(colname => {
          const n = util.colIdxFromName(colname);
          if (n >= 0) {
            myopts.colorder.push(n);
          }
        });
        myopts.columns.forEach((coldef, idx) => {
          if (!state.colorderByName.includes(coldef.name))
            myopts.colorder.push(idx);
        });
        if (myopts.flags.colsResizable) {
          myopts.bodyWidth = state.bodyWidth;
          state.colwidths && _.isArray(state.colwidths) && state.colwidths.forEach(col => {
            const coldef = util.colDefFromName(col.name);
            if (coldef) {
              coldef.width = col.width + 'px';
            }
          });
        }
        state.invisibleColnames.forEach(colname => {
          const n = util.colIdxFromName(colname);
          if (n >= 0) {
            myopts.columns[n].invisible = true;
          }
        });
      }
    };

    const sessionStateUtil = (() => {// saving/loading state
      const saveSessionState = () => {
        const openGroups = getOpenGroups();
        sessionStorage[sessionStorageKey] = JSON.stringify({
          pageCur: self.getPageCur(),
          filters: filteringFcts.getFilterValues(),
          myopts: $.extend({}, myopts, {openGroups: openGroups})
        });
      };
      return {// api
        saveSessionState: saveSessionState
      };
    })();

    // ##############################################################################

    const util = {
      translate: s => $.fn.ebtable.lang[myopts.lang][s] || $.fn.ebtable.lang['de'][s] || s,
      log: () => (opts.debug && console.log.apply(console, [].slice.call(arguments, 0))),
      colIdxFromName: colname => myopts.columns.findIndex(o => o.name === colname),
      colDefFromName: colname => _.findWhere(myopts.columns, {name: colname}),
      colIdFromName: colname => util.colDefFromName(colname).id,
      colNameFromId: colid => (_.findWhere(myopts.columns, {id: colid}) || {}).name,
      colIsInvisible: colname => util.colDefFromName(colname).invisible,
      colIsTechnical: colname => util.colDefFromName(colname).technical,
      getRender: colname => util.colDefFromName(colname).render,
      getVisibleCols: () => myopts.columns.filter(o => !o.invisible),
      getMatch: colname => {
        const matcher = util.colDefFromName(colname).match;
        if (!matcher)
          return $.fn.ebtable.matcher['starts-with-matches'];
        return _.isString(matcher) ? $.fn.ebtable.matcher[matcher] : matcher;
      },
      checkConfig: (myopts, origData) => {
        myopts.columns.forEach(coldef => { // set reasonable defaults for coldefs
          coldef.technical = coldef.technical || false;
          coldef.invisible = coldef.invisible || false;
          coldef.mandatory = coldef.mandatory || false;
          coldef.sortorder = coldef.sortorder || 'asc';
        });
        if (origData[0] && origData[0].length !== myopts.columns.length) {
          alert('Data definition and column definition don\'t match! ' + origData[0].length + ' ' + myopts.columns.length);
          localStorage[localStorageKey] = '';
          myopts = $.extend({}, defopts, opts);
        }
        const ls = localStorage[localStorageKey];
        if (ls && ls.colorder && ls.colorder.length !== myopts.columns.length) {
          alert('Column definition and LocalStorage don\'t match!' + ls.colorder.length + ' ' + myopts.columns.length);
          localStorage[localStorageKey] = '';
          myopts = $.extend({}, defopts, opts);
        }
        myopts.columns.forEach(coldef => {
          if (coldef.technical && !coldef.invisible)
            alert(coldef.name + ": technical column must be invisble!");
          if (coldef.mandatory && coldef.invisible)
            alert(coldef.name + ": mandatory column must be visble!");
        });
      },
      getColWidths: () => {
        return $(selgridid + '.ebtable th').toArray().map(o => {
          const id = $(o).prop('id');
          const w = Math.max(20, $(o).width());
          const name = util.colNameFromId(id);
          util.log($(o).prop('id'), w, name);
          return  {name: name, width: w};
        }).filter(o => !!o.name);
      },
      setDefaultWidthForColumns: () => {
        if (myopts.flags.colsResizable) {
          $(selgridid + '#data table').removeClass('ebtablefix');
          $(selgridid + '#data table th').removeAttr('style');
          const colWidths = util.getColWidths();
          colWidths && colWidths.forEach(o => {
            const id = util.colIdFromName(o.name);
            $(selgridid + 'table th#' + id).width(o.width);
          });
          $(selgridid + '#data table').addClass('ebtablefix');
          stateUtil.saveState();
        }
      }
    };

    // ##############################################################################

    const selectionFcts = {
      selectRow: (rowNr, row, b) => { // b = true/false ~ on/off
        if (!row || row.disabled)
          return;

        myopts.selectionCol.onStartSelection && myopts.selectionCol.onStartSelection(rowNr, row, origData, b);

        row.selected = b;
        const gc = myopts.groupdefs;
        const groupid = row[gc.groupid];
        if (gc && groupid && row[gc.grouplabel] === gc.grouphead) {
          util.log('Groupheader ' + (b ? 'selected!' : 'unselected!'), groupid, row[gc.grouplabel]);
          origData.getGroupRows(gc, groupid).forEach(o => o.selected = b);
          for (var i = 0; i < tblData.length; i++) {
            if (tblData[i][gc.groupid] === groupid) {
              $(selgridid + '#check' + i).prop('checked', b);
            }
          }
        } else {
          util.log('Row ' + (b ? 'selected!' : 'unselected!'), rowNr);
          $(selgridid + '#check' + rowNr).prop('checked', b);
        }
        if (b && myopts.selectionCol && myopts.selectionCol.destCol
                && $(selgridid + '#destRow' + rowNr).prop('checked') && typeof (destId) != 'undefined') {
          $(selgridid + '#destRow' + rowNr).prop('checked', false);
          destId = null;
        }
        myopts.selectionCol && myopts.selectionCol.onSelection && myopts.selectionCol.onSelection(rowNr, row, origData, b);
        $(selgridid + ' #ctrlInfo').html(ctrlInfo());
      },
      selectRows: event => { // select row
        util.log('selectRows', event);
        if (!myopts.selectionCol)
          return;

        const checked = $(event.target).prop('checked');
        if (event.target.id === 'checkAll') {
          if (checked) {
            myopts.selectionCol.onSelectAll && myopts.selectionCol.onSelectAll();
            tblData.forEach((row, rowNr) => selectionFcts.selectRow(rowNr, tblData[rowNr], checked));
            if (typeof (destId) !== 'undefined')
              destId = null;
          } else {
            selectionFcts.deselectAllRows();
          }
        } else {
          if (myopts.selectionCol && myopts.selectionCol.singleSelection) {
            tblData.forEach((row, rowNr) => row.selected && selectionFcts.selectRow(rowNr, row, false));
          }
          const rowNr = event.target.id.replace('check', '');
          selectionFcts.selectRow(rowNr, tblData[rowNr], checked);
          $(selgridid + '#checkAll').prop('checked', false);
        }
      },
      selectDestRow: event => { // select row
        if (!myopts.selectionCol || !myopts.selectionCol.destCol)
          return;
        var rowNr = event.target.id.replace('destRow', '');
        var checked = $(event.target).prop('checked');
        myopts.selectionCol.destCol(rowNr, tblData[rowNr], checked);
        selectionFcts.selectRow(rowNr, tblData[rowNr], false);
        $(selgridid + '#checkAll').prop('checked', false);
      },
      unselect: () => selectionFcts.setSelectedRows(() => false),
      deselectAllRows: () => {
        if (!myopts.selectionCol)
          return;
        if (myopts.selectionCol.onUnselectAll) {
          myopts.selectionCol.onUnselectAll();
        } else if (myopts.selectionCol.onSelection) {
          origData.forEach((row, rowNr) => row.selected && selectionFcts.selectRow(rowNr, row, false));
        }
        $(selgridid + '#data input[type=checkbox]').prop('checked', false);
        origData.forEach(row => row.selected = false);
        $(selgridid + ' #ctrlInfo').html(ctrlInfo());
      },
      iterateSelectedValues: fct => tblData.filter(row => row.selected).forEach(fct),
      getSelectedRows: () => tblData.filter(row => row.selected),
      setSelectedRows: predicateFct => {
        tblData.forEach(row => row.selected = predicateFct(row));
        redraw(pageCur);
      },

    };

    const sortingFcts = {
      showSortingIndicators: () => {
        const colid = util.colIdFromName(myopts.sortcolname);
        const colidx = util.colIdxFromName(myopts.sortcolname);
        const coldef = myopts.columns[colidx];
        const bAsc = coldef.sortorder === 'asc';
        $(selgridid + 'thead div i').removeClass();
        $(selgridid + 'thead #' + colid + ' div i').addClass('fa fa-arrow-circle-' + (bAsc ? 'up' : 'down'));
      },
      getSortState: () => {
        const colidx = util.colIdxFromName(myopts.sortcolname);
        const coldef = myopts.columns[colidx];
        const coldefs = $.extend([], coldef.sortmaster || myopts.sortmaster);
        if (_(_(coldef.sortmaster).pluck('col')).indexOf(colidx) < 0) {
          coldefs.push({col: colidx, sortorder: coldef.sortorder});
        }
        return coldefs;
      },
      sortToggle: () => {
        const sortToggleS = {'desc': 'asc', 'asc': 'desc', 'desc-fix': 'desc-fix', 'asc-fix': 'asc-fix'};
        sortingFcts.getSortState().forEach(o => myopts.columns[o.col].sortorder = sortToggleS[myopts.columns[o.col].sortorder] || 'asc');
      },
      sorting: event => { // sorting
        const colid = event.currentTarget.id;
        if (!suppressSorting && colid && myopts.flags.withsorting) {
          selectionFcts.deselectAllRows();
          myopts.sortcolname = util.colNameFromId(colid);
          sortingFcts.sortToggle();
          if (myopts.hasMoreResults && myopts.reloadData) {
            myopts.reloadData();
          } else {
            sortingFcts.doSort();
            pageCur = 0;
            redraw(pageCur);
          }
        }
      },
      doSort: () => { // sorting
        if (myopts.sortcolname) {
          sortingFcts.showSortingIndicators();
          const colidx = util.colIdxFromName(myopts.sortcolname);
          const coldef = myopts.columns[colidx];
          const coldefs = $.extend([], coldef.sortmaster ? coldef.sortmaster : myopts.sortmaster);
          if (_(_(coldef.sortmaster).pluck('col')).indexOf(colidx) < 0) {
            coldefs.push({col: colidx, sortformat: coldef.sortformat, sortorder: coldef.sortorder});
          }
          coldefs.forEach(o => o.sortorder = myopts.columns[o.col].sortorder || myopts.sortdirection || 'desc');
          tblData = tblData.sort(tblData.rowCmpCols(coldefs, origData.groupsdata));
          util.log('sorting', myopts.sortcolname, JSON.stringify(coldefs));
        }
      }
    };

    const filteringFcts = {
      getFilterValues: () => {
        const filter = {};
        $(selgridid + 'thead th input[type=text],' + selgridid + 'thead th select').each((idx, o) => {
          if ($(o).val().trim())
            filter[o.id] = $(o).val().trim();
        });
        return filter;
      },
      setFilterValues: function (filter, n) {
        n = n || 0;
        if (Object.keys(filter).length === 0)
          return this;
        $(selgridid + 'thead th input[type=text],' + selgridid + 'thead th select').each((idx, o) => $(o).val(filter[o.id]));
        filteringFcts.filterData();
        pageCurMax = Math.floor(Math.max(0, tblData.length - 1) / myopts.rowsPerPage);
        pageCur = n;
        redraw(pageCur);
        return this;
      },
      filterData: () => {
        const filters = _.extend(_.isArray(myopts.predefinedFilters) ? [] : {}, myopts.predefinedFilters);
        $(selgridid + 'thead th input[type=text],' + selgridid + 'thead th select').each((idx, o) => {
          const val = $(o).val();
          if (val && val.trim()) {
            const colid = $(o).attr('id');
            const colname = util.colNameFromId(colid);
            const col = util.colIdxFromName(colname);
            const ren = util.getRender(colname);
            const mat = util.getMatch(colname);
            filters.push({col: col, searchtext: val.trim(), render: ren, match: mat});
          }
        });
        tblData = mx(origData.filterGroups(myopts.groupdefs, origData.groupsdata));
        tblData = mx(tblData.filterData(filters));
        pageCurMax = Math.floor(Math.max(0, tblData.length - 1) / myopts.rowsPerPage);
        sortingFcts.doSort();
      },
      filtering: event => { // filtering
        util.log('filtering', event);
        selectionFcts.deselectAllRows();
        filteringFcts.filterData();
        pageCur = 0;
        redraw(pageCur);
      }
    };

    const getOpenGroups = () => !origData.groupsdata ? [] : origData.groupsdata.reduce((acc, val, key) => !val.isOpen ? acc : acc.concat([parseInt(key)]), []);
    const configButton = () => myopts.flags.config ? `<button id="configButton"> ${util.translate('Spalten verwalten')} <i class="fa fa-random fa-xs"/></button>` : '';
    const clearFilterButton = () => myopts.flags.filter && myopts.flags.clearFilterButton ? `<button id="clearFilterButton"> <i class="fa fa-minus fa-xs" title="${util.translate('Alle Filter entfernen')}"/></button>` : '';
    const arrangeColumnsButton = () => myopts.flags.arrangeColumnsButton ? `<button id="arrangeColumnsButton"> <i class="fa fa-arrows-h" title="${util.translate('Spaltenbreite automatisch anpassen')}"/></button>` : '';
    const selectLenCtrl = () => {
      if (!myopts.flags.pagelenctrl)
        return '';
      const options = myopts.rowsPerPageSelectValues.reduce((acc, o) => {
        const selected = o === myopts.rowsPerPage ? 'selected' : '';
        return acc + '<option value="' + o + '" ' + selected + '>' + o + '</option>\n';
      }, '');
      return '<select id="lenctrl">\n' + options + '</select>\n';
    }

    const pageBrowseCtrl = () =>
            `<button class="firstBtn"><i class="fa fa-fast-backward"></i></button>
             <button class="backBtn"><i class="fa fa-backward"></i></button>
             <button class="nextBtn"><i class="fa fa-forward"/></button>
             <button class="lastBtn"><i class="fa fa-fast-forward"/></button>`;


    const ctrlInfo = () => {
      const cntSel = selectionFcts.getSelectedRows().length;
      const startRow = Math.min(myopts.rowsPerPage * pageCur + 1, tblData.length);
      const endRow = Math.min(startRow + myopts.rowsPerPage - 1, tblData.length);
      const filtered = origData.length === tblData.length ? '' : _.template(util.translate('(<%=len%> Eintr\u00e4ge insgesamt)'))({len: origData.length});
      const cntSelected = (!cntSel || !myopts.selectionCol || myopts.selectionCol.singleSelection) ? '' : _.template(util.translate('(<%=len%> ausgew\u00e4hlt)'))({len: cntSel});
      const templ = _.template(util.translate("<%=start%> bis <%=end%> von <%=count%> Zeilen <%=filtered%> <%=cntsel%>"));
      const label = templ({start: startRow, end: endRow, count: tblData.length, filtered: filtered, cntsel: cntSelected});
      return label;
    }

    const ctrlAddInfo = () => myopts.addInfo && myopts.addInfo(myopts) || '';

    const redrawAddInfo = () => {
      const addInfo = ctrlAddInfo();
      $(selgridid + '#ctrlAddInfo').toggle(!!addInfo).html(addInfo);
    }


    var tableHead = () => {
      let res = '';
      if (myopts.selectionCol) {
        res += '<th class="selectCol">';
        res += (myopts.selectionCol.selectAll ? '<input id="checkAll" type="checkbox">' : '') + '</th>';
      }
      res += myopts.selectionCol && myopts.selectionCol.destCol ? '<th class="selectCol"></th>' : '';
      for (var c = 0; c < myopts.columns.length; c++) {
        var coldef = myopts.columns[myopts.colorder[c]];
        if (!coldef) {
          console.log('no coldef found: colorder idx=' + c + '; columns idx=' + myopts.colorder[c]);
          continue;
        }

        if (!coldef.invisible) {
          var t_inputfld = '<input type="text" id="<%=colid%>" value="<%=filter%> "title="<%=tooltip%>"/>';
          var t_selectfld = '<select id="<%=colid%>" value="<%=filter%>"><%=opts%></select>';
          var opts = (coldef.valuelist || []).reduce((acc, o) => acc + '<option>' + o + '</option>\n', '');
          const t = coldef.valuelist ? t_selectfld : t_inputfld;
          const fld = _.template(t)({colid: coldef.id, opts: opts, tooltip: coldef.tooltip, filter: coldef.filter});
          const thwidth = coldef.width ? 'width:' + coldef.width + ';' : '';
          const thstyle = coldef.css || coldef.width ? ' style="' + thwidth + ' ' + (coldef.css ? coldef.css : '') + '"' : '';
          const hdrTemplate = `
            <th id="<%=colid%>"<%=thstyle%> title="<%=tooltip%>" >
              <div style="display:inline-flex">
                &nbsp;<%=colname%>&nbsp;
                <i />
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
            filtersvisible: (myopts.flags.filter && !coldef.noFilter) ? '' : ' style="display:none"',
          });
        }
      }
      return res;
    }

    const  tableData = pageNr => {
      if (origData[0] && origData[0].length !== myopts.columns.length) {
        util.log('Definition and Data dont match!', origData[0].length, myopts.columns.length);
        return '';
      }

      let res = '';
      const startRow = myopts.rowsPerPage * pageNr;
      const gc = myopts.groupdefs;
      for (var r = startRow; r < Math.min(startRow + myopts.rowsPerPage, tblData.length); r++) {
        const row = tblData[r];

        if (gc && row.isGroupElement && !origData.groupsdata[tblData[r][gc.groupid]].isOpen)
          continue;

        const checked = !!tblData[r].selected ? ' checked="checked" ' : '';
        const disabled = !!tblData[r].disabled ? ' disabled="disabled" ' : '';

        var cls = row.isGroupElement ? ' class="group"' : '';
        cls = row.isGroupHeader ? ' class="groupheader"' : cls;
        cls = disabled ? ' class="disabled"' : cls;
        res += '<tr>';

        if (myopts.selectionCol) {
          if (myopts.selectionCol.render) {
            const x = '<td' + cls + '>' + myopts.selectionCol.render(origData, row, checked) + '</td>';
            res += x.replace('input type', 'input id="check' + r + '"' + checked + disabled + ' type');
          } else if (myopts.selectionCol.singleSelection) {
            res += '<td' + cls + '><input id="check' + r + '" type="radio"' + checked + disabled + '/></td>';
          } else if (!myopts.selectionCol.singleSelection) {
            res += '<td' + cls + '><input id="check' + r + '" type="checkbox"' + checked + disabled + '/></td>';
          }
        }

        const colorder = myopts.colorder;
        for (var c = 0; c < myopts.columns.length; c++) {
          const coldef = myopts.columns[colorder[c]];
          if (coldef && !coldef.invisible) {
            const xx = tblData[r][colorder[c]];
            const v = _.isNumber(xx) ? xx : (xx || '');
            const val = coldef.render ? coldef.render(v, row, r, origData) : v;
            const style = coldef.css ? ' style="' + coldef.css + '"' : '';
            res += '<td ' + cls + style + '>' + val + '</td>';
          }
        }
        res += '</tr>\n';
      }
      return res;
    }


    const reloading = event => { // reloading on <CR> in filter fields
      if (event.which === 13 && myopts.reloadData) {
        util.log('reloading', event, event.which);
        myopts.reloadData();
        event.preventDefault();
      }
    }

    const ignoreSorting = event => {
      event.target.focus();
      return false; // ignore - sorting
    }

    const redraw = (pageCur, withHeader) => {
      if (withHeader) {
        $(selgridid + 'thead tr').html(tableHead());
        initHeaderActions();
      }
      const addInfo = ctrlAddInfo();
      $(selgridid + '.ebtable').width(myopts.bodyWidth);
      $(selgridid + '#ctrlInfo').html(ctrlInfo());
      $(selgridid + '#ctrlAddInfo').toggle(!!addInfo).html(addInfo);
      $(selgridid + '#data tbody').html(tableData(pageCur));
      $(selgridid + '#data input[type=checkbox]').off().on('change', selectionFcts.selectRows);
      $(selgridid + '#data input[type=radio]').off().on('change', selectionFcts.selectRows);
      myopts.selectionCol && myopts.selectionCol.selectOnRowClick && $(selgridid + '#data tr td:not(:first-child)').off().on('click', evt => {
        $(event.target).parent().find('input').trigger('click');
      });
      myopts.selectionCol && myopts.selectionCol.destCol && $(selgridid + '#data .destCol').off().on('change', selectionFcts.selectDestRow);
      myopts.selectionCol && myopts.selectionCol.singleSelection && $(selgridid + '#checkAll').hide();
      myopts.afterRedraw && myopts.afterRedraw($(gridid));
    }

    // #################################################################
    // Actions
    // #################################################################

    const initHeaderActions = () => {
      $(selgridid + 'thead th').off().on('click', sortingFcts.sorting);
      $(selgridid + 'thead input[type=text]').off().on('keypress', reloading).on('keyup', filteringFcts.filtering).on('input', filteringFcts.filtering).on('click', ignoreSorting);
      $(selgridid + 'thead select').off().on('change', filteringFcts.filtering).on('click', ignoreSorting);
      if (myopts.flags.colsResizable) {
        $(selgridid + '.ebtable').resizable({
          handles: 'e',
          minWidth: 150,
          stop: (evt, ui) => {
            myopts.saveState();
            myopts.bodyWidth = ui.size.width;
          }});
        $(selgridid + '.ebtable th').slice(myopts.selectionCol ? 1 : 0).resizable({
          handles: 'e',
          minWidth: 20,
          stop: () => {
            suppressSorting = true;
            myopts.saveState();
            setTimeout(() => {
              suppressSorting = false;
            }, 500);
          }
        });
      }
    }

    const  initActions = () => {
      $(selgridid + '#lenctrl').selectmenu({change: (event, data) => {
          util.log('change rowsPerPage', event, data.item.value);
          myopts.rowsPerPage = Number(data.item.value);
          pageCur = 0;
          pageCurMax = Math.floor(Math.max(0, tblData.length - 1) / myopts.rowsPerPage);
          redraw(pageCur);
          myopts.saveState && myopts.saveState();
        }
      });
      $(selgridid + '#configButton').button().off().on('click', () => {
        const listOfColumnNames = myopts.colorder.reduce((acc, idx) => {
          const t = _.template('<li id="<%=name%>" class="ui-widget-content <%=cls%>"><%=name%></li>');
          const coldef = myopts.columns[idx];
          return acc + (coldef.technical || coldef.mandatory ? '' : t({name: coldef.name, cls: coldef.invisible ? 'invisible' : 'visible'}));
        }, '');
        const dlgopts = {
          listOfColumnNames: listOfColumnNames,
          gridid: gridid,
          cancelstring: util.translate('Abbrechen'),
          anchor: '#' + gridid + ' #configButton',
          callBack: () => {
            $('#' + gridid + 'configDlg li.visible').each((idx, o) => myopts.columns[util.colIdxFromName($(o).prop('id'))].invisible = false);
            $('#' + gridid + 'configDlg li.invisible').each((idx, o) => myopts.columns[util.colIdxFromName($(o).prop('id'))].invisible = true);
            const colnames = [];
            $('#' + gridid + 'configDlg li').each((idx, o) => colnames.push($(o).prop('id')));
            myopts.colorder = myopts.columns.map((col, idx) => col.technical || col.mandatory ? idx : util.colIdxFromName(colnames.shift()));
            myopts.saveState && myopts.saveState();
            if (myopts.onSaveColConfig) {
              const visibleCols = [];
              myopts.columns.map(o => {
                if (!o.mandatory && !o.invisible)
                  visibleCols.push(o.dbcol);
              });
              const config = {};
              config['visibleCols'] = visibleCols;
              config['colorder'] = myopts.colorder.join();
              myopts.onSaveColConfig(JSON.stringify(config));
            }
            if (myopts.bodyWidth === undefined || myopts.bodyWidth === '')
              myopts.bodyWidth = $(window).width() - 20;
            else
              myopts.bodyWidth = Math.min(myopts.bodyWidth, $(window).width() - 20);

            redraw(pageCur, true);
            util.setDefaultWidthForColumns();
          }
        };
        dlgConfig(dlgopts);
      });
      $(selgridid + '.firstBtn').button().on('click', () => {
        pageCur = 0;
        redraw(pageCur);
      });
      $(selgridid + '.backBtn').button().on('click', () => {
        pageCur = Math.max(0, pageCur - 1);
        redraw(pageCur);
      });
      $(selgridid + '.nextBtn').button().on('click', () => {
        pageCur = Math.min(pageCur + 1, pageCurMax);
        redraw(pageCur);
      });
      $(selgridid + '.lastBtn').button().on('click', () => {
        pageCur = pageCurMax;
        redraw(pageCur);
      });
      $(selgridid + '#clearFilterButton').button().off().on('click', () => {
        $(selgridid + 'thead input[type=text]').val('');
        myopts.reloadData && myopts.reloadData();
        filteringFcts.filtering();
      });
      $(selgridid + ' table tbody tr').off().on('click', () => {
        const rowData = tblData[ pageCur * myopts.rowsPerPage + $(this).index()];
        myopts.clickOnRowHandler && myopts.clickOnRowHandler(rowData, $(this));
      });
      $(selgridid + '#data input[type=checkbox]', selgridid + '#data input[type=radio]').off().on('change', selectionFcts.selectRows);
      $(selgridid + '#arrangeColumnsButton').button().off().on('click', util.setDefaultWidthForColumns);

      initHeaderActions();
    }

    const initGrid = a => {
      const tableTemplate = _.template("\
        <div class='ebtable'>\n\
          <div class='ctrl' <%=ctrlStyle%>>\n\
            <div id='ctrlLength' style='float: left;'><%= selectLen  %></div>\n\
            <div id='ctrlConfig'         style='float: left;'><%= configButton %></div>\n\
            <div id='ctrlClearFilter'    style='float: left;'><%= clearFilterButton %></div>\n\
            <div id='ctrlArrangeColumns' style='float: left;'><%= arrangeColumnsButton %></div>\n\
            <div id='ctrlPage1'  style='float: right;'><%= browseBtns %></div>\n\
          </div>\n\
          <div id='data' style='overflow-y:auto;overflow-x:auto; max-height:<%= bodyHeight %>px; width:100%'>\n\
            <table <%= tblClass %>>\n\
              <thead><tr><%= head %></tr></thead>\n\
              <tbody><%= data %></tbody>\n\
            </table>\n\
          </div>\n\
          <div class='ctrl' <%=ctrlStyle%>>\n\
            <div id='ctrlInfo'    style='float: left;' class='ui-widget-content'><%= info %></div>\n\
            <div id='ctrlAddInfo' style='float: left;' class='ui-widget-content'><%= addInfo %></div>\n\
            <div id='ctrlPage2'   style='float: right;' ><%= browseBtns %></div>\n\
          </div>\n\
        </div>");
      a.html(tableTemplate({
        head: tableHead(),
        data: '', //tableData(pageCur),
        selectLen: selectLenCtrl(),
        configButton: configButton(),
        clearFilterButton: clearFilterButton(),
        arrangeColumnsButton: arrangeColumnsButton(),
        browseBtns: pageBrowseCtrl(),
        info: '', //ctrlInfo(),
        addInfo: '', //ctrlAddInfo(),
        ctrlStyle: myopts.flags.ctrls ? '' : 'style="display:none"',
        bodyWidth: myopts.bodyWidth,
        bodyHeight: myopts.bodyHeight,
        tblClass: myopts.flags.colsResizable ? 'class="ebtablefix"' : ''
      }));
      filteringFcts.filterData();
      redraw(pageCur);
    }

    // ##############################################################################

    const defopts = {
      columns: [],
      flags: {
        filter: true,
        pagelenctrl: true,
        config: true,
        withsorting: true,
        clearFilterButton: false,
        arrangeColumnsButton: true,
        colsResizable: false,
        jqueryuiTooltips: true,
        ctrls: true,
      },
      bodyHeight: Math.max(200, $(window).height() - 180),
      bodyWidth: '', // Math.max(700, $(window).width() - 40),
      rowsPerPageSelectValues: [10, 15, 25, 50, 100],
      rowsPerPage: 10,
      pageCur: 0,
      colorder: range(opts.columns.length), // [0,1,2,... ]
      selectionCol: false, // or true or  
      // { 
      //   singleSelection: true,                                 // default: false
      //   selectAll: false,                                      // default: true
      //   destCol: true (call selectDestRow()),                  // default: false - keine Zielspalte bei Admin Stammdaten-Dlgs
      //   selectOnRowClick: true,                                // default: false
      //   render : (origData, row, checked) => {},               // default: null
      //   onStartSelection: (rowNr, row, origData, b) => {},     // default: null
      //   onSelection: (rowNr, row, origData, b) =>{},           // default: null
      //   onSelectAll: ()=>{}                                    // default: null
      //   onUnSelectAll: ()=>{}                                  // default: null
      // }

      saveState: stateUtil.saveState,
      loadState: stateUtil.loadState,
      getState: stateUtil.getState,
      sortmaster: [], //[{col:1,sortorder:asc,sortformat:fct1},{col:2,sortorder:asc-fix}]
      groupdefs: {}, // {grouplabel: 0, groupcnt: 1, groupid: 2, groupsortstring: 3, groupname: 4, grouphead: 'GA', groupelem: 'GB'},
      openGroups: [],
      hasMoreResults: hasMoreResults,
      clickOnRowHandler: (rowData, row) => {
      }, // just for docu
      lang: 'de',
      afterRedraw: null,
      predefinedFilters: [],
    };

    { // trimming opts param
      opts.flags = _.extend(defopts.flags, opts.flags);
      if (opts.flags.colsResizable)
        opts.saveState = defopts.saveState;

      if (opts.selectionCol === true) {
        opts.selectionCol = {selectAll: true}
      }
      if (opts.selectionCol && opts.selectionCol.selectAll === undefined) {
        opts.selectionCol.selectAll = true;
      }
      opts.saveState = typeof opts.saveState === 'boolean' ? stateUtil.saveState : opts.saveState;
    }

    const gridid = this[0].id;
    const self = this;
    const selgridid = '#' + gridid + ' ';
    const localStorageKey = 'ebtable-' + doctitle + '-' + gridid + '-v1.0';
    const myopts = $.extend({}, defopts, opts);

    const origData = mx(data, myopts.groupdefs);
    let tblData = origData;
    let pageCurMax = Math.floor(Math.max(0, origData.length - 1) / myopts.rowsPerPage);
    let pageCur = Math.min(Math.max(0, myopts.pageCur), pageCurMax);


    util.checkConfig(myopts, origData);

    if (myopts.saveState && myopts.getState) {
      myopts.loadState(myopts.getState());
    }

    myopts.columns.forEach((coldef) => coldef.id = coldef.name.replace(/[^\d\w]/g, ''));

    initGrid(this);
    initActions();

    myopts.flags.jqueryuiTooltips && this.tooltip();



// ##########  Exports ############  
    this.util = util;
    $.extend(this, {
      getFilterValues: filteringFcts.getFilterValues,
      setFilterValues: filteringFcts.setFilterValues,
      iterateSelectedValues: selectionFcts.iterateSelectedValues,
      getSelectedRows: selectionFcts.getSelectedRows,
      setSelectedRows: selectionFcts.setSelectedRows,
      unselect: selectionFcts.unselect,
      saveSessionState: sessionStateUtil.saveSessionState,
      redrawAddInfo: redrawAddInfo,

      toggleGroupIsOpen: groupid => {
        origData.groupsdata[groupid].isOpen = !origData.groupsdata[groupid].isOpen;
        filteringFcts.filterData();
        pageCur = Math.min(pageCur, pageCurMax);
        redraw(pageCur);
      },
      groupIsOpen: groupid => _.property('isOpen')(origData.groupsdata[groupid]),
      setSortColname: colname => myopts.sortcolname = colname,
      getSortColname: () => myopts.sortcolname,
      getPageCur: () => pageCur,
      getData: () => origData,
      setData: data => {
        origData = mx(data, myopts.groupdefs);
        tblData = origData;
        pageCurMax = Math.floor(Math.max(0, origData.length - 1) / myopts.rowsPerPage);
        pageCur = Math.min(pageCur, pageCurMax);
        filteringFcts.filterData();
        redraw(pageCur);
      }
    });


    if (myopts.openGroups && myopts.openGroups.length) {
      myopts.loadGroupContent && myopts.loadGroupContent(myopts.openGroups, self);
      myopts.openGroups.forEach(groupid => {
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

  // ##########  sortformats ############  

  $.fn.ebtable.sortformats = {
    'date-de': a => { // '01.01.2013' -->   '20130101' 
      const d = a.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
      return d ? (d[3] + d[2] + d[1]) : '';
    },
    'datetime-de': a => { // '01.01.2013 12:36'  -->  '201301011236' 
      const d = a.match(/^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2})$/);
      return d ? (d[3] + d[2] + d[1] + d[4] + d[5]) : '';
    },
    'datetime-sec-de': a => { // '01.01.2013 12:36:59'  -->  '20130101123659' 
      const d = a.match(/^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2}):(\d{2})$/);
      return d ? (d[3] + d[2] + d[1] + d[4] + d[5] + d[6]) : '';
    },
    'scientific': a => parseFloat(a), // '1e+3'  -->  '1000' 
  };

  // ##########  matcher ############ 

  $.fn.ebtable.matcher = {
    util: {
      getFormatedDate: date => {
        const d = ('0' + date.getDate()).slice(-2);
        const m = ('0' + (date.getMonth() + 1)).slice(-2);
        const y = date.getFullYear();
        const hs = ('0' + date.getHours()).slice(-2);
        const ms = ('0' + date.getMinutes()).slice(-2);
        const ss = ('0' + date.getSeconds()).slice(-2);
        return d + '.' + m + '.' + y + ' ' + hs + ':' + ms + ':' + ss;
      }
    },
    'contains': (cellData, searchTxt) => cellData.toLowerCase().indexOf(searchTxt.toLowerCase()) >= 0,
    'starts-with': (cellData, searchTxt) => cellData.toLowerCase().indexOf(searchTxt.toLowerCase()) === 0,
    'matches': (cellData, searchTxt) => cellData.match(new RegExp('.*' + searchTxt, 'i')),
    'starts-with-matches': (cellData, searchTxt) => cellData.match(new RegExp('^' + searchTxt.replace(/\*/g, '.*'), 'i')),
    'matches-date': (cellData, searchTxt) => $.fn.ebtable.matcher.util.getFormatedDate(new Date(parseInt(cellData))).substr(10).indexOf(searchTxt) >= 0,
    'matches-date-time': (cellData, searchTxt) => $.fn.ebtable.matcher.util.getFormatedDate(new Date(parseInt(cellData))).substr(16).indexOf(searchTxt) >= 0,
    'matches-date-time-sec': (cellData, searchTxt) => $.fn.ebtable.matcher.util.getFormatedDate(new Date(parseInt(cellData))).indexOf(searchTxt) >= 0,
  };

  // ##########  langs ############ 
  $.fn.ebtable.lang = {
    'de': {},
    'en': {
      '(<%=len%> Eintr\u00e4ge insgesamt)': '(<%=len%> entries)',
      '<%=start%> bis <%=end%> von <%=count%> Zeilen <%= filtered %>': '<%=start%> to <%=end%> of <%=count%> shown entries <%= filtered %>',
      'Spalten verwalten': 'Configure',
      'Alle Filter entfernen': 'Remove all filters',
      'Abbrechen': 'Cancel'
    },
  };

  // ##########  sessionState  ############ 
  $.fn.ebtable.loadSessionState = () => sessionStorage[sessionStorageKey] ? JSON.parse(sessionStorage[sessionStorageKey]) : null;
  $.fn.ebtable.removeSessionState = () => delete sessionStorage[sessionStorageKey];

})(jQuery);