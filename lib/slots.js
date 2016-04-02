/* eslint quotes: [0], strict: [0], callback-return: 2  */
"use strict";

var _require = require("zaccaria-cli");

var $d = _require.$d;
var $o = _require.$o;
var $f = _require.$f;
var $fs = _require.$fs;
var _ = _require._;

var $m = require("moment");
var et = require("easy-table");
var sp = require("sparkline");

$m.locale("it");

function dToS(d) {
    return d.format("D MMMM YYYY HH:mm");
}

function generateSlots(prob) {
    var dates = [];
    var start = $m(prob.start, "D MMMM YYYY");
    var end = $m(prob.end, "D MMMM YYYY");
    // we assume end is the last feasible day
    end.add(1, "day");
    var x = start.clone();
    while (x.isBefore(end)) {
        dates.push(x);
        x = x.clone().add(1, "day");
    }
    return dates;
}

function isBetween(d, slot) {
    var from = $m(slot.from, "D MMMM YYYY");
    var to = $m(slot.to, "D MMMM YYYY");
    var res = d.isBetween(from, to, "day") || d.isSame(from, "day") || d.isSame(to, "day");
    return res;
}

function removeWeekends(sol) {
    return _.filter(sol, function (it) {
        return it.isoWeekday() !== 6 && it.isoWeekday() !== 7;
    });
}

function addFixedSlots(prob, sol) {
    return sol.concat(_.map(prob.fixedSlots, function (s) {
        return {
            from: $m("" + s.date + " " + s.from.hour + ":" + s.from.minute, "D MMMM YYYY HH:mm"),
            to: $m("" + s.date + " " + s.to.hour + ":" + s.to.minute, "D MMMM YYYY HH:mm"),
            room: s.room,
            c_aula: s.c_aula,
            tag: s.tag,
            address: s.address,
            note: s.note
        };
    }));
}

function printNote(slot) {
    var dur = slot.to.clone().diff(slot.from, "hours");
    var durnum = dur;
    dur = _.map(_.range(0, dur), function () {
        return "*";
    }).join("");
    return {
        giorno: slot.from.format("DD MM YYYY"),
        durata: dur,
        durNum: durnum,
        aula: slot.room,
        tag: slot.tag,
        note: slot.note
    };
}

function prepareForPrint(slot) {
    var dur = slot.to.clone().diff(slot.from, "hours");
    var durnum = dur;
    dur = _.map(_.range(0, dur), function () {
        return "*";
    }).join("");
    return {
        giorno: slot.from.format("dddd"),
        data: slot.from.format("DD MMMM YYYY"),
        start: slot.from.format("HH.mm"),
        end: slot.to.format("HH.mm"),
        durata: dur,
        durNum: durnum,
        aula: slot.room,
        c_aula: slot.c_aula,
        tag: slot.tag,
        gDate: slot.from.format("MM/DD/YYYY HH:mm"),
        gDuration: durnum * 60,
        gAddress: slot.address
    };
}

function removeHolidays(prob, sol) {
    return _.filter(sol, function (it) {
        var bv = _.map(prob.skip, function (skippedslot) {
            if (isBetween(it, skippedslot)) {
                return true;
            } else {
                return false;
            }
        });
        return !_.any(bv);
    });
}

function createSlots(prob, sol) {
    var slots = [];
    _.map(prob.slots, function (weekslot) {
        _.map(sol, function (feasibleDay) {
            if (feasibleDay.format("ddd") === weekslot.day) {
                var fm = feasibleDay.clone().set("hour", weekslot.from.hour).set("minute", weekslot.from.minute);
                var to = feasibleDay.clone().set("hour", weekslot.to.hour).set("minute", weekslot.to.minute);

                slots.push({
                    from: fm,
                    to: to,
                    room: weekslot.room,
                    c_aula: weekslot.c_aula,
                    tag: weekslot.tag,
                    address: weekslot.address
                });
            }
        });
    });
    return slots;
}

function overlapsWith(s, t) {
    if (s.from.isBetween(t.from, t.to, "hour") || s.to.isBetween(t.from, t.to, "hour")) {
        return true;
    } else {
        return false;
    }
}

function markOverlaps(sol) {
    return _.map(sol, function (s, k) {

        var bv = _.map(sol, function (t, j) {
            if (j !== k && overlapsWith(s, t)) {
                return true;
            } else {
                return false;
            }
        });
        if (_.any(bv)) {
            s.note = "**";
        }
        return s;
    });
}

function retouchSlots(prob, sol) {
    return _.map(sol, function (t) {
        _.map(prob.modify, function (s) {
            var sfrom = $m("" + s.from, "D MMMM YYYY HH:mm");
            var sto = $m("" + s.to, "D MMMM YYYY HH:mm");

            if (t.from.isSame(sfrom) && t.to.isSame(sto)) {
                t.from = $m("" + s["new"].from, "D MMMM YYYY HH:mm");
                t.to = $m("" + s["new"].to, "D MMMM YYYY HH:mm");
            }
        });
        return t;
    });
}

function generateSolution(prob) {
    var sol = generateSlots(prob);
    sol = removeWeekends(sol);
    sol = removeHolidays(prob, sol);
    sol = createSlots(prob, sol);
    sol = retouchSlots(prob, sol);
    sol = addFixedSlots(prob, sol);
    sol = _.sortBy(sol, function (it) {
        return it.from.valueOf();
    });
    sol = markOverlaps(sol);
    return sol;
}

function produceSolution(prob) {
    var sol = generateSolution(prob);
    sol = _.map(sol, prepareForPrint);
    return sol;
}

function produceNotes(prob) {
    var sol = generateSolution(prob);
    sol = _.filter(sol, function (s) {
        if (!_.isUndefined(s.note)) {
            return true;
        } else {
            return false;
        }
    });
    return _.map(sol, printNote);
}

function produceStats(prob, sol) {
    return _.map(prob.tags, function (t) {
        var filtered = _.filter(sol, function (s) {
            if (!_.isUndefined(s.tag)) {
                if (_.includes(s.tag.split(","), t)) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        });

        var ss = _.reduce(_.map(filtered, function (x) {
            return x.durNum;
        }), function (a, n) {
            return a + n;
        });

        return {
            tag: t,
            total: ss
        };
    });
}

module.exports = { produceStats: produceStats, produceSolution: produceSolution, produceNotes: produceNotes };
