"use strict";

var _toConsumableArray = function (arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } };

var _require = require("zaccaria-cli");

var $d = _require.$d;
var $o = _require.$o;
var $f = _require.$f;
var $fs = _require.$fs;
var _ = _require._;
var $b = _require.$b;

var $m = require("moment");

function getNextTopic(topics) {
    var currentTopic = _.head(topics);
    topics = _.tail(topics);
    return {
        topics: topics, currentTopic: currentTopic
    };
}

function getNextSlot(slots) {
    var currentSlot;
    var isLab = true;
    while (isLab) {
        currentSlot = _.head(slots);
        if (!_.isUndefined(currentSlot) && !_.isUndefined(currentSlot.tag)) {
            isLab = _.contains(currentSlot.tag, "lab");
        } else {
            isLab = false;
        }
        slots = _.tail(slots);
    }
    return {
        currentSlot: currentSlot, slots: slots
    };
}

function getDate(slot) {
    return $m("" + slot.data + " " + slot.start, "D MMMM YYYY HH.mm");
}

function toTime(time) {
    return time.format("HH.mm");
}

function getFirstAvailableSlot(howMuch, slots) {
    var currentSlot = _.head(slots);
    slots = _.tail(slots);

    if (currentSlot.durata > howMuch) {
        var remainingSlot = _.cloneDeep(currentSlot);
        remainingSlot.durata = currentSlot.durata - howMuch;
        remainingSlot.start = toTime(getDate(currentSlot).add(howMuch, "minute"));
        return {
            remaining: 0,
            durataOggi: howMuch,
            availableSlot: currentSlot,
            slots: [remainingSlot].concat(_toConsumableArray(slots))
        };
    } else {
        return {
            durataOggi: currentSlot.durata,
            remaining: howMuch - currentSlot.durata,
            availableSlot: currentSlot,
            slots: [].concat(_toConsumableArray(slots))
        };
    }
}

function allocateSlots(slots, topics) {

    var allotted = [];
    var availableSlot;
    var durataOggi;

    _.map(topics, function (it) {
        it.durata = parseInt(it.durata);
    });

    _.map(slots, function (it) {
        it.durata = it.gDuration;
    });

    _.forEach(topics, function (tpc) {
        var i = 1;
        var remaining = tpc.durata;
        while (remaining > 0) {
            var _ref = getFirstAvailableSlot(remaining, slots);

            remaining = _ref.remaining;
            availableSlot = _ref.availableSlot;
            slots = _ref.slots;
            durataOggi = _ref.durataOggi;

            allotted.push({
                giorno: availableSlot.giorno,
                data: availableSlot.data,
                start: availableSlot.start,
                nome: tpc.name,
                durataTotale: tpc.durata,
                durataOggi: durataOggi,
                tag: tpc.tag,
                part: i
            });
            i = i + 1;
        }
    });
    return allotted;
}

module.exports = {
    allocateSlots: allocateSlots
};
