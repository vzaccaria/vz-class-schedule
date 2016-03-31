/*eslint quotes: [0] */

"use strict";

var chai = require("chai");
chai.use(require("chai-as-promised"));
var should = chai.should();

var z = require("zaccaria-cli");
var promise = z.$b;
var fs = z.$fs;
var _ = z._;

/**
 * Promised version of shelljs exec
 * @param  {string} cmd The command to be executed
 * @return {promise}     A promise for the command output
 */
function exec(cmd) {
    "use strict";
    return new promise(function (resolve, reject) {
        require("shelljs").exec(cmd, {
            async: true,
            silent: true
        }, function (code, output) {
            if (code !== 0) {
                reject(output);
            } else {
                resolve(output);
            }
        });
    });
}

/*global describe, it, before, beforeEach, after, afterEach */

describe("#command", function () {
    "use strict";
    it("should show help", function () {
        var usage = fs.readFileSync("" + __dirname + "/../docs/usage.md", "utf8");
        return exec("" + __dirname + "/../index.js -h").should.eventually.contain(usage);
    });
});

var jsonTest = [{
    msg: "generate valid json",
    cmd: "./index.js schedule ./fixtures/2015-2016.json -j",
    file: "./fixtures/2015-2016-solved.json"
}, {
    msg: "generate valid schedule",
    cmd: "./index.js schedule ./fixtures/2015-2016.json",
    file: "./fixtures/2015-2016-solved.txt"
}];

describe("#json", function () {
    _.map(jsonTest, function (j) {
        var q = j;
        it("should " + q.msg + " [ " + q.cmd + " > " + q.file + " ] ", function () {
            var f = fs.readFileSync(q.file, "utf8");
            return exec(q.cmd).should.eventually.equal(f);
        });
    });
});