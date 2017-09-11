var {
    $d, $o, $f, $fs, _, $b
} = require('zaccaria-cli');

var $m = require('moment');

function getNextTopic(topics) {
    var currentTopic = _.head(topics);
    topics = _.tail(topics);
    return {
        topics, currentTopic
    };
}

function getNextSlot(slots) {
    var currentSlot;
    var isLab = true;
    while (isLab) {
        currentSlot = _.head(slots);
        if (!_.isUndefined(currentSlot) && !_.isUndefined(currentSlot.tag)) {
            isLab = _.contains(currentSlot.tag, 'lab');
        } else {
            isLab = false;
        }
        slots = _.tail(slots);
    }
    return {
        currentSlot, slots
    };
}

function getDate(slot) {
    return $m(`${slot.data} ${slot.start}`, "D MMMM YYYY HH.mm");
}

function toTime(time) {
    return time.format('HH.mm');
}

function getFirstAvailableSlot(howMuch, slots) {
    var currentSlot = _.head(slots);
    slots = _.tail(slots);

    if (currentSlot.durata > howMuch) {
        var remainingSlot = _.cloneDeep(currentSlot);
        remainingSlot.durata = currentSlot.durata - howMuch;
        remainingSlot.start = toTime(getDate(currentSlot).add(howMuch, 'minute'));
        return {
            remaining: 0,
            durataOggi: howMuch,
            availableSlot: currentSlot,
            slots: [remainingSlot, ...slots]
        };
    } else {
        return {
            durataOggi: currentSlot.durata,
            remaining: howMuch - currentSlot.durata,
            availableSlot: currentSlot,
            slots: [...slots]
        };
    }
}

function allocateSlots(slots, topics) {

    var allotted = [];
    var availableSlot;
    var durataOggi;

    _.map(topics, it => {
        it.durata = parseInt(it.durata);
    });

    _.map(slots, it => {
        it.durata = it.gDuration;
    });

    _.forEach(topics, tpc => {
        var i = 1;
        var remaining = tpc.durata;
        while (remaining > 0) {
            ({
                remaining, availableSlot, slots, durataOggi
            } = getFirstAvailableSlot(remaining, slots));
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
    allocateSlots
};
