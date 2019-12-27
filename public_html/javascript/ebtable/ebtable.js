/* global _,jQuery,mx *//* jshint multistr: true */ /* jshint expr: true */
(function ($) {
  "use strict";
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
      open: function () {
        $('ol#' + opts.gridid + 'selectable').sortable();
        $('#' + opts.gridid + 'configDlg li').off('click').on('click', function (event) {
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
      getStateAsJSON: function () {
        const stateGeneral = {
          rowsPerPage: myopts.rowsPerPage,
          colorderByName: myopts.colorder.map(function (idx) {
            return myopts.columns[idx].name;
          }),
          invisibleColnames: myopts.columns.reduce(function (acc, o) {
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
        if (!state){
          util.setDefaultWidthForColumns();
          return;
        }
        myopts.rowsPerPage = state.rowsPerPage;
        myopts.colorder = [];
        state.colorderByName.forEach(function (colname) {
          const n = util.colIdxFromName(colname);
          if (n >= 0) {
            myopts.colorder.push(n);
          }
        });
        myopts.columns.forEach(function (coldef, idx) {
          if (!_.contains(state.colorderByName, coldef.name))
            myopts.colorder.push(idx);
        });
        if (myopts.flags.colsResizable) {
          myopts.bodyWidth = state.bodyWidth;
          state.colwidths && _.isArray(state.colwidths) && state.colwidths.forEach(function (col) {
            const coldef = util.colDefFromName(col.name);
            if (coldef) {
              coldef.width = col.width + 'px';
            }
          });
        }
        state.invisibleColnames.forEach(function (colname) {
          const n = util.colIdxFromName(colname);
          if (n >= 0) {
            myopts.columns[n].invisible = true;
          }
        });
      }
    };

    const sessionStateUtil = (function () {// saving/loading state
      const saveSessionState = function () {
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
      translate: function translate(str) {
        const listOfStrings = $.fn.ebtable.lang[myopts.lang] || $.fn.ebtable.lang['de'];
        return listOfStrings[str] || str;
      },
      log: function log() {
        opts.debug && console.log.apply(console, [].slice.call(arguments, 0));
      },
      colIdxFromName: function colIdxFromName(colname) {
        return _.findIndex(myopts.columns, function (o) {
          return o.name === colname;
        });
      },
      colDefFromName: function (colname) {
        return _.findWhere(myopts.columns, {name: colname});
      },
      colIdFromName: function colNameFromId(colname) {
        return util.colDefFromName(colname).id;
      },
      colNameFromId: function colNameFromId(colid) {
        return  (_.findWhere(myopts.columns, {id: colid}) || {}).name;
      },
      colIsInvisible: function colIsInvisible(colname) {
        return util.colDefFromName(colname).invisible;
      },
      colIsTechnical: function colIsTechnical(colname) {
        return util.colDefFromName(colname).technical;
      },
      getRender: function getRender(colname) {
        return util.colDefFromName(colname).render;
      },
      getMatch: function getMatch(colname) {
        const matcher = util.colDefFromName(colname).match;
        if (!matcher)
          return $.fn.ebtable.matcher['starts-with-matches'];
        return _.isString(matcher) ? $.fn.ebtable.matcher[matcher] : matcher;
      },
      getVisibleCols: function getVisibleCols() {
        return myopts.columns.filter(function (o) {
          return !o.invisible;
        });
      },
      checkConfig: function checkConfig(myopts, origData) {
        myopts.columns.forEach(function (coldef) { // set reasonable defaults for coldefs
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
        myopts.columns.forEach(function (coldef) {
          if (coldef.technical && !coldef.invisible)
            alert(coldef.name + ": technical column must be invisble!");
          if (coldef.mandatory && coldef.invisible)
            alert(coldef.name + ": mandatory column must be visble!");
        });
      },
      getColWidths: function getColWidths() {
        return $(selgridid + '.ebtable th').toArray().map(function (o) {
          const id = $(o).prop('id');
          const w = Math.max(20, $(o).width());
          const name = util.colNameFromId(id);
          util.log($(o).prop('id'), w, name);
          const ret = {name: name, width: w};
          return ret;
        }).filter(function (o) {
          return o.name;
        });
      },
      setDefaultWidthForColumns: function () {
        if( myopts.flags.colsResizable ) {
          $(selgridid + '#data table').removeClass('ebtablefix');
          $(selgridid + '#data table th').removeAttr('style');
          const colWidths = util.getColWidths();
          colWidths && colWidths.forEach(function (o) {
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
      selectRow: function selectRow(rowNr, row, b) { // b = true/false ~ on/off
        if (!row || row.disabled)
          return;
        
        myopts.selectionCol.onStartSelection && myopts.selectionCol.onStartSelection(rowNr, row, origData, b);

        row.selected = b;
        const gc = myopts.groupdefs;
        const groupid = row[gc.groupid];
        if (gc && groupid && row[gc.grouplabel] === gc.grouphead) {
          util.log('Groupheader ' + (b ? 'selected!' : 'unselected!'), groupid, row[gc.grouplabel]);
          origData.getGroupRows(gc, groupid).forEach(function (o) {
            o.selected = b;
          });
          for (var i = 0; i < tblData.length; i++) {
            if (tblData[i][gc.groupid] === groupid) {
              $(selgridid + '#check' + i).prop('checked', b);
            }
          }
        } else {
          util.log('Row ' + (b ? 'selected!' : 'unselected!'), rowNr);
          $(selgridid + '#check' + rowNr).prop('checked', b);
        }
        myopts.selectionCol && myopts.selectionCol.onSelection && myopts.selectionCol.onSelection(rowNr, row, origData, b);
        $(selgridid + ' #ctrlInfo').html(ctrlInfo());
      },
      selectRows: function selectRows(event) { // select row
        util.log('selectRows', event);
        if (!myopts.selectionCol)
          return;
        
        const checked = $(event.target).prop('checked');
        if (event.target.id === 'checkAll') {
          if (checked) {
            myopts.selectionCol.onSelectAll && myopts.selectionCol.onSelectAll();
            tblData.forEach(function (row, rowNr) {
              selectionFcts.selectRow(rowNr, tblData[rowNr], checked);
            });
          } else {
            selectionFcts.deselectAllRows();
          }
        } else {
          if (myopts.selectionCol && myopts.selectionCol.singleSelection) {
            tblData.forEach(function (row, rowNr) {
              if (row.selected)
                selectionFcts.selectRow(rowNr, row, false);
            });
          }
          const rowNr = event.target.id.replace('check', '');
          selectionFcts.selectRow(rowNr, tblData[rowNr], checked);
          $(selgridid + '#checkAll').prop('checked', false);
        }
      },
      deselectAllRows: function deselectAllRows() {
        if (!myopts.selectionCol)
          return;
        if (myopts.selectionCol.onUnselectAll) {
          myopts.selectionCol.onUnselectAll();
        } else if (myopts.selectionCol.onSelection) {
          origData.forEach(function (row, rowNr) {
            if (row.selected) {
              selectionFcts.selectRow(rowNr, row, false);
            }
          });
        }
        $(selgridid + '#data input[type=checkbox]').prop('checked', false);
        origData.forEach(function (row) {
          row.selected = false;
        });
        $(selgridid + ' #ctrlInfo').html(ctrlInfo());
      },
      iterateSelectedValues: function iterateSelectedValues(fct) {
        tblData.filter(function (row) {
          return row.selected;
        }).forEach(fct);
      },
      getSelectedRows: function getSelectedRows() {
        return tblData.filter(function (row) {
          return row.selected;
        });
      },
      setSelectedRows: function setSelectedRows(predicateFct) {
        tblData.forEach(function (row) {
          row.selected = predicateFct(row);
        });
        redraw(pageCur);
      },
      unselect: function unselect() {
        selectionFcts.setSelectedRows(function () {
          return false;
        });
      }
    };

    const sortingFcts = {
      showSortingIndicators: function showSortingIndicators() {
        const colid = util.colIdFromName(myopts.sortcolname);
        const colidx = util.colIdxFromName(myopts.sortcolname);
        const coldef = myopts.columns[colidx];
        const bAsc = coldef.sortorder === 'asc';
        $(selgridid + 'thead div span.ui-icon').removeClass().addClass('ui-icon ui-icon-blank');
        $(selgridid + 'thead #' + colid + ' div span.ui-icon:nth-child(2)').addClass('ui-icon ui-icon-arrow-1-' + (bAsc ? 'n' : 's'));
      },
      getSortState: function getSortState() {
        const colidx = util.colIdxFromName(myopts.sortcolname);
        const coldef = myopts.columns[colidx];
        const coldefs = $.extend([], coldef.sortmaster || myopts.sortmaster);
        if (_(_(coldef.sortmaster).pluck('col')).indexOf(colidx) < 0) {
          coldefs.push({col: colidx, sortorder: coldef.sortorder});
        }
        return coldefs;
      },
      sortToggle: function sortToggle() {
        const sortToggleS = {'desc': 'asc', 'asc': 'desc', 'desc-fix': 'desc-fix', 'asc-fix': 'asc-fix'};
        sortingFcts.getSortState().forEach(function (o) {
          myopts.columns[o.col].sortorder = sortToggleS[myopts.columns[o.col].sortorder] || 'asc';
        });
      },
      sorting: function sorting(event) { // sorting
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
      doSort: function doSort() { // sorting
        if (myopts.sortcolname) {
          sortingFcts.showSortingIndicators();
          const colidx = util.colIdxFromName(myopts.sortcolname);
          const coldef = myopts.columns[colidx];
          const coldefs = $.extend([], coldef.sortmaster ? coldef.sortmaster : myopts.sortmaster);
          if (_(_(coldef.sortmaster).pluck('col')).indexOf(colidx) < 0) {
            coldefs.push({col: colidx, sortformat: coldef.sortformat, sortorder: coldef.sortorder});
          }
          coldefs.forEach(function (o) {
            o.sortorder = myopts.columns[o.col].sortorder || myopts.sortdirection || 'desc';
          });
          tblData = tblData.sort(tblData.rowCmpCols(coldefs, origData.groupsdata));
          util.log('sorting', myopts.sortcolname, JSON.stringify(coldefs));
        }
      }
    };

    const filteringFcts = {
      getFilterValues: function getFilterValues() {
        const filter = {};
        $(selgridid + 'thead th input[type=text],' + selgridid + 'thead th select').each(function (idx, o) {
          if ($.trim($(o).val()))
            filter[o.id] = $(o).val().trim();
        });
        return filter;
      },
      setFilterValues: function setFilterValues(filter, n) {
        n = n || 0;
        if (_.keys(filter).length === 0)
          return this;
        $(selgridid + 'thead th input[type=text],' + selgridid + 'thead th select').each(function (idx, o) {
          $(o).val(filter[o.id]);
        });
        filteringFcts.filterData();
        pageCurMax = Math.floor(Math.max(0, tblData.length - 1) / myopts.rowsPerPage);
        pageCur = n;
        redraw(pageCur);
        return this;
      },
      filterData: function filterData() {
        const filters = _.extend(_.isArray(myopts.predefinedFilters) ? [] : {}, myopts.predefinedFilters);
        $(selgridid + 'thead th input[type=text],' + selgridid + 'thead th select').each(function (idx, o) {
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
      filtering: function filtering(event) { // filtering
        util.log('filtering', event);
        selectionFcts.deselectAllRows();
        filteringFcts.filterData();
        pageCur = 0;
        redraw(pageCur);
      }
    };

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
      bodyWidth: '', //Math.max(700, $(window).width() - 40),
      rowsPerPageSelectValues: [10, 25, 50, 100],
      rowsPerPage: 10,
      pageCur: 0,
      colorder: _.range(opts.columns.length), // [0,1,2,... ]
      selectionCol: false, // or true or  
      // { 
      //   singleSelection: true,                                 // default: false
      //   selectOnRowClick: true,                                // default: false
      //   render : function(origData, row, checked){},           // default: null
      //   onStartSelection: function(rowNr, row, origData, b){}, // default: null
      //   onSelection: function(rowNr, row, origData, b){},      // default: null
      //   onSelectAll: function(){}                              // default: null
      //   onSelectAll: function(){}                              // default: null
      // }
      
      saveState: stateUtil.saveState,
      loadState: stateUtil.loadState,
      getState: stateUtil.getState,
      sortmaster: [], //[{col:1,sortorder:asc,sortformat:fct1},{col:2,sortorder:asc-fix}]
      groupdefs: {}, // {grouplabel: 0, groupcnt: 1, groupid: 2, groupsortstring: 3, groupname: 4, grouphead: 'GA', groupelem: 'GB'},
      openGroups: [],
      hasMoreResults: hasMoreResults,
      clickOnRowHandler: function (rowData, row) {}, // just for docu
      lang: 'de',
      afterRedraw: null,
      predefinedFilters: [],
    };

    { // trimming opts param
      opts.flags = _.extend(defopts.flags, opts.flags);
      if (opts.flags.colsResizable)
        opts.saveState = defopts.saveState;
      opts.saveState = typeof opts.saveState === 'boolean' ? stateUtil.saveState : opts.saveState;
    }

    const gridid = this[0].id;
    const self = this;
    const selgridid = '#' + gridid + ' ';
    const localStorageKey = 'ebtable-' + doctitle + '-' + gridid + '-v1.0';
    const myopts = $.extend({}, defopts, opts);

    const origData = mx(data, myopts.groupdefs);
    const tblData = origData;
    const pageCurMax = Math.floor(Math.max(0, origData.length - 1) / myopts.rowsPerPage);
    const pageCur = Math.min(Math.max(0, myopts.pageCur), pageCurMax);
    

    util.checkConfig(myopts, origData);

    if (myopts.saveState && myopts.getState) {
      myopts.loadState(myopts.getState());
    }

    myopts.columns.forEach(function (coldef) {
      coldef.id = coldef.name.replace(/[^\d\w]/g, '');
    });

    initGrid(this);
    initActions();


    myopts.flags.jqueryuiTooltips && this.tooltip();


    function getOpenGroups() {
      return _.reduce(origData.groupsdata, function (acc, val, key) {
        if (val.isOpen) {
          acc.push(parseInt(key));
        }
        return acc;
      }, []);
    }

    function initGrid(a) {
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

    function configButton() {
      return myopts.flags.config ? '<button id="configButton">' + util.translate('Spalten verwalten') + ' <span class="ui-icon ui-icon-shuffle"></button>' : '';
    }

    function clearFilterButton() {
      return myopts.flags.filter && myopts.flags.clearFilterButton ? '<button id="clearFilterButton"><span class="ui-icon ui-icon-minus" title="' + util.translate('Alle Filter entfernen') + '"></button>' : '';
    }
    
    function arrangeColumnsButton() {
      return myopts.flags.arrangeColumnsButton ? '<button id="arrangeColumnsButton"><span class="ui-icon ui-icon-arrow-2-e-w" title="' + util.translate('Spaltenbreite automatisch abpassen') + '"></button>' : '';
    }
    
    function tableHead() {
      const res = myopts.selectionCol ? '<th class="selectCol"><input id="checkAll" type="checkbox"></th>' : '';
      for (var c = 0; c < myopts.columns.length; c++) {
        const coldef = myopts.columns[myopts.colorder[c]];
        if (!coldef.invisible) {
          const t_inputfld = '<input type="text" id="<%=colid%>" value="<%=filter%> "title="<%=tooltip%>"/>';
          const t_selectfld = '<select id="<%=colid%>" value="<%=filter%>"><%=opts%></select>';
          const opts = (coldef.valuelist || []).reduce(function (acc, o) {
            return acc + '<option>' + o + '</option>\n';
          }, '');
          const t = coldef.valuelist ? t_selectfld : t_inputfld;
          const fld = _.template(t)({colid: coldef.id, opts: opts, tooltip: coldef.tooltip, filter: coldef.filter});
          const thwidth = coldef.width ? 'width:' + coldef.width + ';' : '';
          const thstyle = coldef.css || coldef.width ? ' style="' + thwidth + ' ' + (coldef.css ? coldef.css : '') + '"' : '';
          const hdrTemplate = '\
            <th id="<%=colid%>"<%=thstyle%> title="<%=tooltip%>" >\n\
              <div style="display:inline-flex">\n\
                <span style="float:left" class="ui-icon ui-icon-blank"></span>\n\
                <%=colname%>\n\
                <span style="float:right" class="ui-icon ui-icon-blank"></span>\n\
              </div>\n\
              <div<%=filtersvisible%>><%=fld%></div>\n\
            </th>';
          // &#8209; = non breakable hyphen : &#0160; = non breakable space
          res += _.template(hdrTemplate)({
            colname: coldef.name.replace(/-/g, '&#8209;').replace(/ /g, '&#0160;'),
            colid: coldef.id,
            fld: fld,
            thstyle: thstyle,
            tooltip: coldef.tooltip,
            filtersvisible: (myopts.flags.filter ? '' : ' style="display:none"'),
          });
        }
      }
      return res;
    }

    function tableData(pageNr) {
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

        const cls = row.isGroupElement ? ' class="group"' : '';
        cls = row.isGroupHeader ? ' class="groupheader"' : cls;
        res += '<tr>';
        const checked = !!tblData[r].selected ? ' checked="checked" ' : '';
        const disabled = !!tblData[r].disabled ? ' disabled="disabled" ' : '';

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
          if (!coldef.invisible) {
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

    function selectLenCtrl() {
      if (!myopts.flags.pagelenctrl)
        return '';
      const options = myopts.rowsPerPageSelectValues.reduce(function (acc, o) {
        const selected = o === myopts.rowsPerPage ? 'selected' : '';
        return acc + '<option value="' + o + '" ' + selected + '>' + o + '</option>\n';
      }, '');
      return '<select id="lenctrl">\n' + options + '</select>\n';
    }

    function pageBrowseCtrl() {
      return '<button class="firstBtn"><span class="ui-icon ui-icon-seek-first"/></button>\
              <button class="backBtn"><span  class="ui-icon ui-icon-seek-prev" /></button>\
              <button class="nextBtn"><span  class="ui-icon ui-icon-seek-next" /></button>\
              <button class="lastBtn"><span  class="ui-icon ui-icon-seek-end"  /></button>';
    }

    function ctrlInfo() {
      const cntSel = selectionFcts.getSelectedRows().length;
      const startRow = Math.min(myopts.rowsPerPage * pageCur + 1, tblData.length);
      const endRow = Math.min(startRow + myopts.rowsPerPage - 1, tblData.length);
      const filtered = origData.length === tblData.length ? '' : _.template(util.translate('(<%=len%> Eintr\u00e4ge insgesamt)'))({len: origData.length});
      const cntSelected = (!cntSel || !myopts.selectionCol || myopts.selectionCol.singleSelection) ? '' : _.template(util.translate('(<%=len%> ausgew\u00e4hlt)'))({len: cntSel});
      const templ = _.template(util.translate("<%=start%> bis <%=end%> von <%=count%> Zeilen <%=filtered%> <%=cntsel%>"));
      const label = templ({start: startRow, end: endRow, count: tblData.length, filtered: filtered, cntsel: cntSelected});
      return label;
    }

    function ctrlAddInfo() {
      return (myopts.addInfo && myopts.addInfo(myopts)) || '';
    }
    
    function redrawAddInfo() {
      const addInfo = ctrlAddInfo();
      $(selgridid + '#ctrlAddInfo').toggle(!!addInfo).html(addInfo);
    } 

    function reloading(event) { // reloading on <CR> in filter fields
      if (event.which === 13 && myopts.reloadData) {
        util.log('reloading', event, event.which);
        myopts.reloadData();
        event.preventDefault();
      }
    }

    function ignoreSorting(event) {
      event.target.focus();
      return false; // ignore - sorting
    }

    function redraw(pageCur, withHeader) {
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
      myopts.selectionCol && myopts.selectionCol.selectOnRowClick && $(selgridid + '#data tr td:not(:first-child)').off().on('click', function (evt) {
        $(event.target).parent().find('input').trigger('click');
      });
      myopts.selectionCol && myopts.selectionCol.singleSelection && $(selgridid + '#checkAll').hide();
      myopts.afterRedraw && myopts.afterRedraw($(gridid));
    }


    // #################################################################
    // Actions
    // #################################################################

    function initHeaderActions() {
      $(selgridid + 'thead th').off().on('click', sortingFcts.sorting);
      $(selgridid + 'thead input[type=text]').off().on('keypress', reloading).on('keyup', filteringFcts.filtering).on('click', ignoreSorting);
      $(selgridid + 'thead select').off().on('change', filteringFcts.filtering).on('click', ignoreSorting);
      if (myopts.flags.colsResizable) {
        $(selgridid + '.ebtable').resizable({
          handles: 'e',
          minWidth: 150,
          stop: function (evt, ui) {
            myopts.saveState();
            myopts.bodyWidth = ui.size.width;
          }});
        $(selgridid + '.ebtable th').slice(myopts.selectionCol ? 1 : 0).resizable({
          handles: 'e',
          minWidth: 20,
          stop: function () {
            suppressSorting = true;
            myopts.saveState();
            setTimeout(function () {
              suppressSorting = false;
            }, 500);
          }
        });
      }
    }

    function initActions() {
      $(selgridid + '#lenctrl').selectmenu({change: function (event, data) {
          util.log('change rowsPerPage', event, data.item.value);
          myopts.rowsPerPage = Number(data.item.value);
          pageCur = 0;
          pageCurMax = Math.floor(Math.max(0, tblData.length - 1) / myopts.rowsPerPage);
          redraw(pageCur);
          myopts.saveState && myopts.saveState();
        }
      });
      $(selgridid + '#configButton').button().off().on('click', function () {
        const listOfColumnNames = myopts.colorder.reduce(function (acc, idx) {
          const t = _.template('<li id="<%=name%>" class="ui-widget-content <%=cls%>"><%=name%></li>');
          const coldef = myopts.columns[idx];
          return acc + (coldef.technical || coldef.mandatory ? '' : t({name: coldef.name, cls: coldef.invisible ? 'invisible' : 'visible'}));
        }, '');
        const dlgopts = {
          listOfColumnNames: listOfColumnNames,
          gridid: gridid,
          cancelstring: util.translate('Abbrechen'),
          anchor: '#' + gridid + ' #configButton',
          callBack: function () {
            $('#' + gridid + 'configDlg li.visible').each(function (idx, o) {
              myopts.columns[util.colIdxFromName($(o).prop('id'))].invisible = false;
            });
            $('#' + gridid + 'configDlg li.invisible').each(function (idx, o) {
              myopts.columns[util.colIdxFromName($(o).prop('id'))].invisible = true;
            });
            const colnames = [];
            $('#' + gridid + 'configDlg li').each(function (idx, o) {
              colnames.push($(o).prop('id'));
            });
            myopts.colorder = myopts.columns.map(function (col, idx) {
              return col.technical || col.mandatory ? idx : util.colIdxFromName(colnames.shift());
            });
            myopts.saveState && myopts.saveState();
            myopts.bodyWidth = Math.min(myopts.bodyWidth || $(window).width() - 20, $(window).width() - 20);
            //const filters = self.getFilterValues();
            redraw(pageCur, true);
            //self.setFilterValues(filters);
          }
        };
        dlgConfig(dlgopts);
      });
      $(selgridid + '.firstBtn').button().on('click', function () {
        pageCur = 0;
        redraw(pageCur);
      });
      $(selgridid + '.backBtn').button().on('click', function () {
        pageCur = Math.max(0, pageCur - 1);
        redraw(pageCur);
      });
      $(selgridid + '.nextBtn').button().on('click', function () {
        pageCur = Math.min(pageCur + 1, pageCurMax);
        redraw(pageCur);
      });
      $(selgridid + '.lastBtn').button().on('click', function () {
        pageCur = pageCurMax;
        redraw(pageCur);
      });
      $(selgridid + '#clearFilterButton').button().off().on('click', function () {
        $(selgridid + 'thead input[type=text]').val('');
        myopts.reloadData && myopts.reloadData();
        filteringFcts.filtering();
      });
      $(selgridid + ' table tbody tr').off().on('click', function () {
        const rowData = tblData[ pageCur * myopts.rowsPerPage + $(this).index()];
        myopts.clickOnRowHandler && myopts.clickOnRowHandler(rowData, $(this));
      });
      $(selgridid + '#data input[type=checkbox]', selgridid + '#data input[type=radio]').off().on('change', selectionFcts.selectRows);
      //$(selgridid + '.ctrl').off().on('dblclick', util.setDefaultWidthForColumns);
      $(selgridid + '#arrangeColumnsButton').button().off().on('click',util.setDefaultWidthForColumns) ;

      initHeaderActions();
    }

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

      toggleGroupIsOpen: function (groupid) {
        origData.groupsdata[groupid].isOpen = !origData.groupsdata[groupid].isOpen;
        filteringFcts.filterData();
        pageCur = Math.min(pageCur, pageCurMax);
        redraw(pageCur);
      },
      groupIsOpen: function (groupid) {
        return _.property('isOpen')(origData.groupsdata[groupid]);
      },
      setSortColname: function (colname) {
        myopts.sortcolname = colname;
      },
      getSortColname: function () {
        return myopts.sortcolname;
      },
      getPageCur: function () {
        return pageCur;
      },
      getData: function () {
        return origData;
      },
      setData: function (data) {
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
      myopts.openGroups.forEach(function (groupid) {
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
    'date-de':  a => { // '01.01.2013' -->   '20130101' 
      const d = a.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
      return d ? (d[3] + d[2] + d[1]) : '';
    },
    'datetime-de': a => { // '01.01.2013 12:36'  -->  '201301011236' 
      const d = a.match(/^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2})$/);
      return d ? (d[3] + d[2] + d[1] + d[4] + d[5]) : '';
    },
    'datetime-sec-de':  a => { // '01.01.2013 12:36:59'  -->  '20130101123659' 
      const d = a.match(/^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2}):(\d{2})$/);
      return d ? (d[3] + d[2] + d[1] + d[4] + d[5] + d[6]) : '';
    },
    'scientific': a =>  parseFloat(a),  // '1e+3'  -->  '1000' 
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
    'starts-with-matches': (cellData, searchTxt)=> cellData.match(new RegExp('^' + searchTxt.replace(/\*/g, '.*'), 'i')),
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