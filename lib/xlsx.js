/* eslint quotes: [0], strict: [0], callback-return: 2  */
"use strict";

var _require = require("zaccaria-cli");

var $d = _require.$d;
var $o = _require.$o;
var $f = _require.$f;
var $fs = _require.$fs;
var _ = _require._;

var XLSX = require("xlsx");

var $m = require("moment");

function wbNew() {
    return {
        SheetNames: [],
        Sheets: {}
    };
}

function newCellRef(col, row) {
    return XLSX.utils.encode_cell({
        c: col,
        r: row
    });
}

/* From: view-source:http://sheetjs.com/demos/writexlsx.html */

function datenum(v, date1904) {
    if (date1904) v += 1462;
    var epoch = Date.parse(v);
    return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
}

function addType(cell) {
    if (typeof cell.v === "number") cell.t = "n";else if (typeof cell.v === "boolean") cell.t = "b";else if (cell.v instanceof Date) {
        cell.t = "n";
        cell.z = XLSX.SSF._table[14];
        cell.v = datenum(cell.v);
    } else cell.t = "s";

    return cell;
}

function jsonToWorksheet(list, opts) {
    var ws = {};
    var colNames = _.keys(list[0]);

    /* Produce header */
    var header = _.map(colNames, function (name, i) {
        var cRef = newCellRef(i, 0);
        var cData = {
            v: name
        };
        cData = addType(cData);
        return {
            cRef: cRef, cData: cData
        };
    });

    var content = _.map(list, function (data, i) {
        var rowIndex = i + 1;
        var rowData = _.values(data);
        return _.map(rowData, function (dt, colIndex) {
            var cRef = newCellRef(colIndex, rowIndex);
            var cData = {
                v: dt
            };
            cData = addType(cData);
            return {
                cRef: cRef, cData: cData
            };
        });
    });
    content = _.flattenDeep([header, content]);
    _.each(content, function (el) {
        ws[el.cRef] = el.cData;
    });
    ws["!ref"] = XLSX.utils.encode_range({
        e: {
            c: colNames.length - 1,
            r: list.length
        },
        s: {
            c: 0,
            r: 0
        }
    });
    return ws;
}

function docente(data) {
    var tags = data.tag.split(",");
    if (_.includes(tags, "lec")) {
        return {
            docente: "N",
            docente_ospite: "Zaccaria"
        };
    } else {
        return {
            docente: "S",
            docente_ospite: "Responsabili lab"
        };
    }
}

function prepareForExcel(data) {
    var newData = {};
    var date = $m(data.gDate, "MM/DD/YYYY HH:mm");
    var datef = date.clone().add(data.durNum, "hour");
    var tags = data.tag.split(",");
    newData.data_lezione_day = parseInt(date.format("DD"));
    newData.data_lezione_month = parseInt(date.format("MM"));
    newData.data_lezione_year = parseInt(date.format("YYYY"));
    newData.sede = _.get(data, "sede", "BV");
    newData.c_aula = _.get(data, "c_aula", "NA");
    newData.c_forma_didattica = _.get(data, "c_forma_didattica", 0);
    newData.inizio_ore = parseInt(date.format("HH"));
    newData.inizio_ore_minuti = parseInt(date.format("mm"));
    newData.termine_ore = parseInt(datef.format("HH"));
    newData.termine_ore_minuti = parseInt(datef.format("mm"));
    newData.n_ore_lez = data.durNum;
    newData.n_ore_lez_min = 0;
    newData = _.assign(newData, docente(data));
    if (this.addTags) {
        var tgs = _.groupBy(_.map(this.tags, function (tag) {
            if (_.includes(tags, tag)) {
                var value = data.durNum;
                return {
                    tag: tag, value: value
                };
            } else {
                var value = 0;
                return {
                    tag: tag, value: value
                };
            }
        }), "tag");
        tgs = _.mapValues(tgs, function (l) {
            return l[0].value;
        });
        newData = _.assign(newData, tgs);
    }
    newData.contenuto = "NA";

    return newData;
}

function produceJsonForImport(data, prob) {
    prob.addTags = false;
    return _.map(data, prepareForExcel, prob);
}

function produceExcel(data, name, prob) {
    prob.addTags = true;
    var wb = wbNew();
    wb.SheetNames = ["generated"];
    wb.Sheets.generated = jsonToWorksheet(_.map(data, prepareForExcel, prob));
    XLSX.writeFile(wb, name);
}

module.exports = {
    produceExcel: produceExcel, produceJsonForImport: produceJsonForImport
};
