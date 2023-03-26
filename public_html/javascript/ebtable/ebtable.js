const range = (n) => [...Array(n).keys()]
const dlgConfig = function (opts) {
    const dlgTemplate = _.template('\
        <div id="<%=gridid%>configDlg">\n\
          <ol id="<%=gridid%>selectable" class="ebtableSelectable"> \n\
            <%= listOfColumnNames %> \n\
          </ol>\n\
        </div>')({listOfColumnNames: opts.listOfColumnNames, gridid: opts.gridid});

    const dlgOpts = {
        open: () => {
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
    dlgOpts.buttons['OK'] = function () {
        opts.callBack();
        $(this).dialog("destroy");
    };
    dlgOpts.buttons[opts.cancelstring] = function () {
        $(this).dialog("destroy");
    };

    $(dlgTemplate).dialog(dlgOpts).parent().find('.ui-widget-header').hide();
};

(function ($) {
    "use strict";
    const docTitle = $(document).prop('title').replace(/ /g, '');
    const sessionStorageKey = 'ebtable-' + docTitle + '-v1.0';
    let suppressSorting = false;

    //###########################################################################################################

    $.fn.ebtable = function (opts, data, hasMoreResults) {

        const stateUtil = {// saving/loading state
            getStateAsJSON: function () {
                const stateGeneral = {
                    rowsPerPage: myOpts.rowsPerPage,
                    colorderByName: myOpts.colorder.map(function (idx) {
                        return myOpts.columns[idx].name;
                    }),
                    invisibleColnames: myOpts.columns.reduce(function (acc, o) {
                        if (o.invisible && !o.technical)
                            acc.push(o.name);
                        return acc;
                    }, [])
                };
                const stateWidth = {
                    colwidths: util.getColWidths()
                };
                const state = _.extend({}, stateGeneral, myOpts.flags.colsResizable ? stateWidth : {});
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
                myOpts.colorder = [];
                state.colorderByName.forEach(function (colname) {
                    const n = util.colIdxFromName(colname);
                    if (n >= 0) {
                        myOpts.colorder.push(n);
                    }
                });
                myOpts.columns.forEach(function (coldef, idx) {
                    if (!_.contains(state.colorderByName, coldef.name))
                        myOpts.colorder.push(idx);
                });
                if (myOpts.flags.colsResizable) {
                    myOpts.bodyWidth = state.bodyWidth;
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
                        myOpts.columns[n].invisible = true;
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
                    myopts: $.extend({}, myOpts, {openGroups: openGroups})
                });
            };
            return {// api
                saveSessionState: saveSessionState
            };
        })();

        // ##############################################################################

        const util = {
            translate: (str) => {
                const listOfStrings = $.fn.ebtable.lang[myOpts.lang] || $.fn.ebtable.lang['de'];
                return listOfStrings[str] || str;
            },
            log: () => {
                opts.debug && console.log.apply(console, [].slice.call(arguments, 0));
            },
            colIdxFromName: (colname) => myOpts.columns.findIndex((o) => o.name === colname),
            colDefFromName: (colname) => _.findWhere(myOpts.columns, {name: colname}),
            colIdFromName: (colname) => util.colDefFromName(colname).id,
            colNameFromId: (colid) => (_.findWhere(myOpts.columns, {id: colid}) || {}).name,
            colIsInvisible: (colname) => util.colDefFromName(colname).invisible,
            colIsTechnical: (colname) => util.colDefFromName(colname).technical,
            getRender: (colname) => util.colDefFromName(colname).render,
            getMatch: (colname) => {
                const matcher = util.colDefFromName(colname).match;
                if (!matcher)
                    return $.fn.ebtable.matcher['starts-with-matches'];
                return _.isString(matcher) ? $.fn.ebtable.matcher[matcher] : matcher;
            },
            getVisibleCols: () => myOpts.columns.filter((o) => !o.invisible),
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
                return $(selGridId + '.ebtable th').toArray().map(function (o) {
                    const id = $(o).prop('id');
                    const w = Math.max(20, $(o).width());
                    const name = util.colNameFromId(id);
                    util.log($(o).prop('id'), w, name);
                    return  {name: name, width: w};
                }).filter(function (o) {
                    return o.name;
                });
            },
            setDefaultWidthForColumns: function () {
                if (myOpts.flags.colsResizable) {
                    $(selGridId + '#data table').removeClass('ebtablefix');
                    $(selGridId + '#data table th').removeAttr('style');
                    const colWidths = util.getColWidths();
                    colWidths && colWidths.forEach(function (o) {
                        const id = util.colIdFromName(o.name);
                        $(selGridId + 'table th#' + id).width(o.width);
                    });
                    $(selGridId + '#data table').addClass('ebtablefix');
                    stateUtil.saveState();
                }
            }
        };

        // ##############################################################################

        const selectionFcts = {
            selectRow: function selectRow(rowNr, row, b) { // b = true/false ~ on/off
                if (!row || row.disabled)
                    return;

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
            selectRows: function selectRows(event) { // select row
                util.log('selectRows', event);
                if (!myOpts.selectionCol)
                    return;

                const checked = $(event.target).prop('checked');
                if (event.target.id === 'checkAll') {
                    if (checked) {
                        myOpts.selectionCol.onSelectAll && myOpts.selectionCol.onSelectAll();
                        tblData.forEach(function (row, rowNr) {
                            selectionFcts.selectRow(rowNr, tblData[rowNr], checked);
                        });
                    } else {
                        selectionFcts.deselectAllRows();
                    }
                } else {
                    if (myOpts.selectionCol && myOpts.selectionCol.singleSelection) {
                        tblData.forEach(function (row, rowNr) {
                            if (row.selected)
                                selectionFcts.selectRow(rowNr, row, false);
                        });
                    }
                    const rowNr = event.target.id.replace('check', '');
                    selectionFcts.selectRow(rowNr, tblData[rowNr], checked);
                    $(selGridId + '#checkAll').prop('checked', false);
                }
            },
            deselectAllRows: function deselectAllRows() {
                if (!myOpts.selectionCol)
                    return;
                if (myOpts.selectionCol.onUnselectAll) {
                    myOpts.selectionCol.onUnselectAll();
                } else if (myOpts.selectionCol.onSelection) {
                    origData.forEach(function (row, rowNr) {
                        if (row.selected) {
                            selectionFcts.selectRow(rowNr, row, false);
                        }
                    });
                }
                $(selGridId + '#data input[type=checkbox]').prop('checked', false);
                origData.forEach(function (row) {
                    row.selected = false;
                });
                $(selGridId + ' #ctrlInfo').html(ctrlInfo());
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
                const colid = util.colIdFromName(myOpts.sortcolname);
                const colidx = util.colIdxFromName(myOpts.sortcolname);
                const coldef = myOpts.columns[colidx];
                const bAsc = coldef.sortorder === 'asc';
                $(`${selGridId} thead #${colid} div i`).removeClass().addClass('fa fa-arrow-' + (bAsc ? 'up' : 'down'));
            },
            getSortState: function getSortState() {
                const colidx = util.colIdxFromName(myOpts.sortcolname);
                const coldef = myOpts.columns[colidx];
                const coldefs = $.extend([], coldef.sortmaster || myOpts.sortmaster);
                if (_(_(coldef.sortmaster).pluck('col')).indexOf(colidx) < 0) {
                    coldefs.push({col: colidx, sortorder: coldef.sortorder});
                }
                return coldefs;
            },
            sortToggle: function sortToggle() {
                const sortToggleS = {'desc': 'asc', 'asc': 'desc', 'desc-fix': 'desc-fix', 'asc-fix': 'asc-fix'};
                sortingFcts.getSortState().forEach(function (o) {
                    myOpts.columns[o.col].sortorder = sortToggleS[myOpts.columns[o.col].sortorder] || 'asc';
                });
            },
            sorting: function sorting(event) { // sorting
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
            doSort: function doSort() { // sorting
                if (myOpts.sortcolname) {
                    sortingFcts.showSortingIndicators();
                    const colidx = util.colIdxFromName(myOpts.sortcolname);
                    const coldef = myOpts.columns[colidx];
                    const coldefs = $.extend([], coldef.sortmaster ? coldef.sortmaster : myOpts.sortmaster);
                    if (_(_(coldef.sortmaster).pluck('col')).indexOf(colidx) < 0) {
                        coldefs.push({col: colidx, sortformat: coldef.sortformat, sortorder: coldef.sortorder});
                    }
                    coldefs.forEach(function (o) {
                        o.sortorder = myOpts.columns[o.col].sortorder || myOpts.sortdirection || 'desc';
                    });
                    tblData = tblData.sort(tblData.rowCmpCols(coldefs, origData.groupsdata));
                    util.log('sorting', myOpts.sortcolname, JSON.stringify(coldefs));
                }
            }
        };

        const filteringFcts = {
            getFilterValues: function getFilterValues() {
                const filter = {};
                $(selGridId + 'thead th input[type=text],' + selGridId + 'thead th select').each(function (idx, o) {
                    if ($.trim($(o).val()))
                        filter[o.id] = $(o).val().trim();
                });
                return filter;
            },
            setFilterValues: function setFilterValues(filter, n) {
                n = n || 0;
                if (_.keys(filter).length === 0)
                    return this;
                $(selGridId + 'thead th input[type=text],' + selGridId + 'thead th select').each(function (idx, o) {
                    $(o).val(filter[o.id]);
                });
                filteringFcts.filterData();
                pageCurMax = Math.floor(Math.max(0, tblData.length - 1) / myOpts.rowsPerPage);
                pageCur = n;
                redraw(pageCur);
                return this;
            },
            filterData: function filterData() {
                const filters = _.extend(_.isArray(myOpts.predefinedFilters) ? [] : {}, myOpts.predefinedFilters);
                $(selGridId + 'thead th input[type=text],' + selGridId + 'thead th select').each(function (idx, o) {
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
                tblData = mx(origData.filterGroups(myOpts.groupdefs, origData.groupsdata));
                tblData = mx(tblData.filterData(filters));
                pageCurMax = Math.floor(Math.max(0, tblData.length - 1) / myOpts.rowsPerPage);
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
            rowsPerPageSelectValues: [5, 10, 25, 50, 100],
            rowsPerPage: 5,
            pageCur: 0,
            colorder: range(opts.columns.length), // [0,1,2,... ]
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
            clickOnRowHandler: function (rowData, row) {
            }, // just for docu
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

        const gridId = this[0].id;
        const self = this;
        const selGridId = '#' + gridId + ' ';
        const localStorageKey = 'ebtable-' + docTitle + '-' + gridId + '-v1.0';
        const myOpts = {...defopts, ...opts};

        let origData = mx(data, myOpts.groupdefs);
        let tblData = origData;
        let pageCurMax = Math.floor(Math.max(0, origData.length - 1) / myOpts.rowsPerPage);
        let pageCur = Math.min(Math.max(0, myOpts.pageCur), pageCurMax);


        util.checkConfig(myOpts, origData);

        if (myOpts.saveState && myOpts.getState) {
            myOpts.loadState(myOpts.getState());
        }

        myOpts.columns.forEach(function (coldef) {
            coldef.id = coldef.name.replace(/[^\w]/g, '');
        });

        initGrid(this);
        initActions();


        myOpts.flags.jqueryuiTooltips && this.tooltip();


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
                ctrlStyle: myOpts.flags.ctrls ? '' : 'style="display:none"',
                bodyWidth: myOpts.bodyWidth,
                bodyHeight: myOpts.bodyHeight,
                tblClass: myOpts.flags.colsResizable ? 'class="ebtablefix"' : ''
            }));
            filteringFcts.filterData();
            redraw(pageCur);
        }

        function configButton() {
            return myOpts.flags.config ? '<button id="configButton">' + util.translate('Spalten verwalten') + ' <span class="ui-icon ui-icon-shuffle"></button>' : '';
        }

        function clearFilterButton() {
            return myOpts.flags.filter && myOpts.flags.clearFilterButton ? '<button id="clearFilterButton"><span class="ui-icon ui-icon-minus" title="' + util.translate('Alle Filter entfernen') + '"></button>' : '';
        }

        function arrangeColumnsButton() {
            return myOpts.flags.arrangeColumnsButton ? '<button id="arrangeColumnsButton"><span class="ui-icon ui-icon-arrow-2-e-w" title="' + util.translate('Spaltenbreite automatisch abpassen') + '"></button>' : '';
        }

        function tableHead() {
            let res = myOpts.selectionCol ? '<th class="selectCol"><input id="checkAll" type="checkbox"></th>' : '';
            for (let c = 0; c < myOpts.columns.length; c++) {
                const coldef = myOpts.columns[myOpts.colorder[c]];
                if (!coldef.invisible) {
                    const t_inputfld = '<input type="text" id="<%=colid%>" value="<%=filter%> " title="<%=tooltip%>"/>';
                    const t_selectfld = '<select id="<%=colid%>" value="<%=filter%>"><%=opts%></select>';
                    const opts = (coldef.valuelist || []).reduce(function (acc, o) {
                        return acc + '<option>' + o + '</option>\n';
                    }, '');
                    const t = coldef.valuelist ? t_selectfld : t_inputfld;
                    const fld = _.template(t)({
                        colid: coldef.id,
                        opts: opts,
                        tooltip: coldef.tooltip,
                        filter: coldef.filter
                    });
                    const thwidth = coldef.width ? 'width:' + coldef.width + ';' : '';
                    const thstyle = coldef.css || coldef.width ? ' style="' + thwidth + ' ' + (coldef.css ? coldef.css : '') + '"' : '';
                    const hdrTemplate = '\
            <th id="<%=colid%>"<%=thstyle%> title="<%=tooltip%>" >\n\
              <div style="display:inline-flex">\n\
                <%=colname%>\n\
                <i class="fa fa-arrow-up"></i>\n\
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
                        filtersvisible: (myOpts.flags.filter ? '' : ' style="display:none"'),
                    });
                }
            }
            return res;
        }

        function tableData(pageNr) {
            if (origData[0] && origData[0].length !== myOpts.columns.length) {
                util.log('Definition and Data dont match!', origData[0].length, myOpts.columns.length);
                return '';
            }

            let res = '';
            const startRow = myOpts.rowsPerPage * pageNr;
            const gc = myOpts.groupdefs;
            for (let r = startRow; r < Math.min(startRow + myOpts.rowsPerPage, tblData.length); r++) {
                const row = tblData[r];

                if (gc && row.isGroupElement && !origData.groupsdata[tblData[r][gc.groupid]].isOpen)
                    continue;

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
            if (!myOpts.flags.pagelenctrl)
                return '';
            const options = myOpts.rowsPerPageSelectValues.reduce(function (acc, o) {
                const selected = o === myOpts.rowsPerPage ? 'selected' : '';
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
            const startRow = Math.min(myOpts.rowsPerPage * pageCur + 1, tblData.length);
            const endRow = Math.min(startRow + myOpts.rowsPerPage - 1, tblData.length);
            const filtered = origData.length === tblData.length ? '' : _.template(util.translate('(<%=len%> Eintr\u00e4ge insgesamt)'))({len: origData.length});
            const cntSelected = (!cntSel || !myOpts.selectionCol || myOpts.selectionCol.singleSelection) ? '' : _.template(util.translate('(<%=len%> ausgew\u00e4hlt)'))({len: cntSel});
            const templ = _.template(util.translate("<%=start%> bis <%=end%> von <%=count%> Zeilen <%=filtered%> <%=cntsel%>"));
            return templ({
                start: startRow,
                end: endRow,
                count: tblData.length,
                filtered: filtered,
                cntsel: cntSelected
            });
        }

        function ctrlAddInfo() {
            return (myOpts.addInfo && myOpts.addInfo(myOpts)) || '';
        }

        function redrawAddInfo() {
            const addInfo = ctrlAddInfo();
            $(selGridId + '#ctrlAddInfo').toggle(!!addInfo).html(addInfo);
        }

        function reloading(event) { // reloading on <CR> in filter fields
            if (event.which === 13 && myOpts.reloadData) {
                util.log('reloading', event, event.which);
                myOpts.reloadData();
                event.preventDefault();
            }
        }

        function ignoreSorting(event) {
            event.target.focus();
            return false; // ignore - sorting
        }

        function redraw(pageCur, withHeader) {
            if (withHeader) {
                $(selGridId + 'thead tr').html(tableHead());
                initHeaderActions();
            }
            const addInfo = ctrlAddInfo();
            $(selGridId + '.ebtable').width(myOpts.bodyWidth);
            $(selGridId + '#ctrlInfo').html(ctrlInfo());
            $(selGridId + '#ctrlAddInfo').toggle(!!addInfo).html(addInfo);
            $(selGridId + '#data tbody').html(tableData(pageCur));
            $(selGridId + '#data input[type=checkbox]').off().on('change', selectionFcts.selectRows);
            $(selGridId + '#data input[type=radio]').off().on('change', selectionFcts.selectRows);
            myOpts.selectionCol && myOpts.selectionCol.selectOnRowClick && $(selGridId + '#data tr td:not(:first-child)').off().on('click', function () {
                $(event.target).parent().find('input').trigger('click');
            });
            myOpts.selectionCol && myOpts.selectionCol.singleSelection && $(selGridId + '#checkAll').hide();
            myOpts.afterRedraw && myOpts.afterRedraw($(gridId));
        }


        // #################################################################
        // Actions
        // #################################################################

        function initHeaderActions() {
            $(selGridId + 'thead th').off().on('click', sortingFcts.sorting);
            $(selGridId + 'thead input[type=text]').off().on('keypress', reloading).on('keyup', filteringFcts.filtering).on('click', ignoreSorting);
            $(selGridId + 'thead select').off().on('change', filteringFcts.filtering).on('click', ignoreSorting);
            if (myOpts.flags.colsResizable) {
                $(selGridId + '.ebtable').resizable({
                    handles: 'e',
                    minWidth: 150,
                    stop: function (evt, ui) {
                        myOpts.saveState();
                        myOpts.bodyWidth = ui.size.width;
                    }
                });
                $(selGridId + '.ebtable th').slice(myOpts.selectionCol ? 1 : 0).resizable({
                    handles: 'e',
                    minWidth: 20,
                    stop: function () {
                        suppressSorting = true;
                        myOpts.saveState();
                        setTimeout(function () {
                            suppressSorting = false;
                        }, 500);
                    }
                });
            }
        }

        function initActions() {
            $(selGridId + '#lenctrl').selectmenu({
                change: function (event, data) {
                    util.log('change rowsPerPage', event, data.item.value);
                    myOpts.rowsPerPage = Number(data.item.value);
                    pageCur = 0;
                    pageCurMax = Math.floor(Math.max(0, tblData.length - 1) / myOpts.rowsPerPage);
                    redraw(pageCur);
                    myOpts.saveState && myOpts.saveState();
                }
            });
            $(selGridId + '#configButton').button().off().on('click', function () {
                const listOfColumnNames = myOpts.colorder.reduce(function (acc, idx) {
                    const t = _.template('<li id="<%=name%>" class="ui-widget-content <%=cls%>"><%=name%></li>');
                    const coldef = myOpts.columns[idx];
                    return acc + (coldef.technical || coldef.mandatory ? '' : t({
                        name: coldef.name,
                        cls: coldef.invisible ? 'invisible' : 'visible'
                    }));
                }, '');
                const dlgopts = {
                    listOfColumnNames: listOfColumnNames,
                    gridid: gridId,
                    cancelstring: util.translate('Abbrechen'),
                    anchor: '#' + gridId + ' #configButton',
                    callBack: function () {
                        $('#' + gridId + 'configDlg li.visible').each(function (idx, o) {
                            myOpts.columns[util.colIdxFromName($(o).prop('id'))].invisible = false;
                        });
                        $('#' + gridId + 'configDlg li.invisible').each(function (idx, o) {
                            myOpts.columns[util.colIdxFromName($(o).prop('id'))].invisible = true;
                        });
                        const colnames = [];
                        $('#' + gridId + 'configDlg li').each(function (idx, o) {
                            colnames.push($(o).prop('id'));
                        });
                        myOpts.colorder = myOpts.columns.map(function (col, idx) {
                            return col.technical || col.mandatory ? idx : util.colIdxFromName(colnames.shift());
                        });
                        myOpts.saveState && myOpts.saveState();
                        myOpts.bodyWidth = Math.min(myOpts.bodyWidth || $(window).width() - 20, $(window).width() - 20);
                        redraw(pageCur, true);
                    }
                };
                dlgConfig(dlgopts);
            });
            $(selGridId + '.firstBtn').button().on('click', function () {
                pageCur = 0;
                redraw(pageCur);
            });
            $(selGridId + '.backBtn').button().on('click', function () {
                pageCur = Math.max(0, pageCur - 1);
                redraw(pageCur);
            });
            $(selGridId + '.nextBtn').button().on('click', function () {
                pageCur = Math.min(pageCur + 1, pageCurMax);
                redraw(pageCur);
            });
            $(selGridId + '.lastBtn').button().on('click', function () {
                pageCur = pageCurMax;
                redraw(pageCur);
            });
            $(selGridId + '#clearFilterButton').button().off().on('click', function () {
                $(selGridId + 'thead input[type=text]').val('');
                myOpts.reloadData && myOpts.reloadData();
                filteringFcts.filtering();
            });
            $(selGridId + ' table tbody tr').off().on('click', function () {
                const rowData = tblData[pageCur * myOpts.rowsPerPage + $(this).index()];
                myOpts.clickOnRowHandler && myOpts.clickOnRowHandler(rowData, $(this));
            });
            $(selGridId + '#data input[type=checkbox]', selGridId + '#data input[type=radio]').off().on('change', selectionFcts.selectRows);
            //$(selgridid + '.ctrl').off().on('dblclick', util.setDefaultWidthForColumns);
            $(selGridId + '#arrangeColumnsButton').button().off().on('click', util.setDefaultWidthForColumns);

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
                myOpts.sortcolname = colname;
            },
            getSortColname: function () {
                return myOpts.sortcolname;
            },
            getPageCur: function () {
                return pageCur;
            },
            getData: function () {
                return origData;
            },
            setData: function (data) {
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
            myOpts.openGroups.forEach(function (groupid) {
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
        'date-de': function (a) { // '01.01.2013' -->   '20130101'
            const d = a.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
            return d ? (d[3] + d[2] + d[1]) : '';
        },
        'datetime-de': function (a) { // '01.01.2013 12:36'  -->  '201301011236'
            const d = a.match(/^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2})$/);
            return d ? (d[3] + d[2] + d[1] + d[4] + d[5]) : '';
        },
        'datetime-sec-de': function (a) { // '01.01.2013 12:36:59'  -->  '20130101123659'
            const d = a.match(/^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2}):(\d{2})$/);
            return d ? (d[3] + d[2] + d[1] + d[4] + d[5] + d[6]) : '';
        },
        'scientific': function (a) { // '1e+3'  -->  '1000'
            return parseFloat(a);
        }
    };

    // ##########  matcher ############

    $.fn.ebtable.matcher = {
        util: {
            getFormatedDate: function getFormatedDate(date) {
                const d = ('0' + date.getDate()).slice(-2);
                const m = ('0' + (date.getMonth() + 1)).slice(-2);
                const y = date.getFullYear();
                const hs = ('0' + date.getHours()).slice(-2);
                const ms = ('0' + date.getMinutes()).slice(-2);
                const ss = ('0' + date.getSeconds()).slice(-2);
                return d + '.' + m + '.' + y + ' ' + hs + ':' + ms + ':' + ss;
            }
        },
        'contains': function (cellData, searchTxt) {
            return cellData.toLowerCase().indexOf(searchTxt.toLowerCase()) >= 0;
        },
        'starts-with': function (cellData, searchTxt) {
            return cellData.toLowerCase().indexOf(searchTxt.toLowerCase()) === 0;
        },
        'matches': function (cellData, searchTxt) {
            return cellData.match(new RegExp('.*' + searchTxt, 'i'));
        },
        'starts-with-matches': function (cellData, searchTxt) {
            return cellData.match(new RegExp('^' + searchTxt.replace(/\*/g, '.*'), 'i'));
        },
        'matches-date': function (cellData, searchTxt) {
            return $.fn.ebtable.matcher.util.getFormatedDate(new Date(parseInt(cellData))).substr(10).indexOf(searchTxt) >= 0;
        },
        'matches-date-time': function (cellData, searchTxt) {
            return $.fn.ebtable.matcher.util.getFormatedDate(new Date(parseInt(cellData))).substr(16).indexOf(searchTxt) >= 0;
        },
        'matches-date-time-sec': function (cellData, searchTxt) {
            return $.fn.ebtable.matcher.util.getFormatedDate(new Date(parseInt(cellData))).indexOf(searchTxt) >= 0;
        }
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
    $.fn.ebtable.loadSessionState = function () {
        const x = sessionStorage[sessionStorageKey];
        return x ? JSON.parse(x) : null;
    };
    $.fn.ebtable.removeSessionState = function () {
        delete sessionStorage[sessionStorageKey];
    };

})(jQuery);