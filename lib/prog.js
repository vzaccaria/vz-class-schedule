/* eslint quotes: [0], strict: [0], callback-return: 2, no-use-before-define: 2 */
"use strict";

var _require = require("zaccaria-cli");

var _ = _require._;

var flat = require("flat");

function getHeadingFromKey(it) {
    var r = /^([0-9]+)\.([0-9]+)\.raw-value/g.exec(it);
    if (r) {
        var path = "" + r[1] + "." + r[2];
        return {
            name: this.flattened[it],
            number: r[1],
            path: path,
            durata: this.flattened["" + path + ".DURATA"]
        };
    } else {
        return null;
    }
}

function getSubheadingsFromHeading(h) {
    var _this = this;

    var rexp = new RegExp("^(" + h.number + ".[0-9]+).([0-9]+).raw-value");
    var subh = _.filter(_.map(this.keys, function (it) {
        var r = rexp.exec(it);
        if (r) {
            var path = r[1];
            return {
                name: "" + h.name + " - " + _this.flattened[it],
                durata: _this.flattened["" + path + "." + r[2] + ".DURATA"],
                tag: _this.flattened["" + path + "." + r[2] + ".tags.0"]
            };
        }
    }));
    return subh;
}

function parseTopics(prog) {
    var flattened = flat(prog);
    var keys = _.keys(flattened);
    var headings = _.filter(_.map(keys, getHeadingFromKey, {
        keys: keys, flattened: flattened
    }));
    var subHeadings = _.map(headings, getSubheadingsFromHeading, {
        keys: keys, flattened: flattened
    });
    subHeadings = _.flatten(subHeadings);
    return subHeadings;
}

module.exports = {
    parseTopics: parseTopics
};
