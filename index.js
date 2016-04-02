#!/usr/bin/env node
/* eslint quotes: [0], strict: [0], callback-return: 2, no-use-before-define: 2 */
"use strict";

var _require = require("zaccaria-cli");

var $d = _require.$d;
var $o = _require.$o;
var $f = _require.$f;
var $fs = _require.$fs;
var _ = _require._;
var $b = _require.$b;

var et = require("easy-table");

var _require2 = require("./lib/xlsx");

var produceExcel = _require2.produceExcel;
var produceJsonForImport = _require2.produceJsonForImport;

var _require3 = require("./lib/slots");

var produceStats = _require3.produceStats;
var produceSolution = _require3.produceSolution;
var produceNotes = _require3.produceNotes;

var getOptions = function (doc) {
    "use strict";
    var o = $d(doc);
    var help = $o("-h", "--help", false, o);
    var program = $o("-p", "--program", undefined, o);
    var problem = o.PROBLEM;
    var schedule = o.schedule;
    var googlecal = $o("-g", "--googlecal", false, o);
    var xlsx = $o("-x", "--xlsx", false, o);
    var json = $o("-j", "--json", false, o);
    var imprt = $o("-i", "--import", false, o);

    return {
        help: help, problem: problem, program: program, schedule: schedule, googlecal: googlecal, xlsx: xlsx, json: json, imprt: imprt
    };
};

// gcalcli --calendar "ZaccariaInfoB1516" --title "Informatica B" --where "L01" --when "10/6/2015 13:15" --duration 120 --description 'xyz' --reminder 30 add --nocache

function produceGoogleCalEntry(it) {
    var dsc = "normale";
    if (_.contains(it.tag, "lab")) {
        dsc = "laboratorio";
    }
    var cli = "gcalcli --when \"" + it.gDate + "\" --calendar \"" + this.calendar + "\" --title \"" + this.title + " in aula " + it.aula + "\" --where \"" + it.gAddress + "\" --duration " + it.gDuration + " --description \"" + dsc + "\" --reminder \"60\" add --nocache";
    console.log(cli);
}

var main = function () {
    $fs.readFileAsync(__dirname + "/docs/usage.md", "utf8").then(function (it) {
        var _getOptions = getOptions(it);

        var help = _getOptions.help;
        var problem = _getOptions.problem;
        var schedule = _getOptions.schedule;
        var googlecal = _getOptions.googlecal;
        var xlsx = _getOptions.xlsx;
        var json = _getOptions.json;
        var imprt = _getOptions.imprt;

        if (help) {
            console.log(it);
        } else {
            if (schedule) {
                $b.all([$fs.readFileAsync(problem, "utf8")]).then(function (res) {
                    var prob = res[0];
                    prob = JSON.parse(prob);
                    var sol = produceSolution(prob);
                    var stats = produceStats(prob, sol);
                    var notes = produceNotes(prob);
                    if (googlecal) {
                        _.map(sol, produceGoogleCalEntry, prob);
                    } else {
                        if (xlsx) {
                            produceExcel(sol, "" + problem + ".xlsx", prob);
                        } else {
                            if (json) {
                                var all = {
                                    solutions: sol,
                                    statistics: stats,
                                    notes: notes
                                };
                                if (!imprt) {
                                    console.log(JSON.stringify(all, 0, 4));
                                } else {
                                    console.log(JSON.stringify(produceJsonForImport(sol, prob), 0, 4));
                                }
                            } else {
                                console.log(et.print(sol));
                                console.log(et.print(stats));
                                console.log(et.print(notes));
                            }
                        }
                    }
                });
            }
        }
    });
};

main();
