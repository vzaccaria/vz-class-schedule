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
}, {
    msg: "generate valid schedule to import",
    cmd: "./index.js schedule ./fixtures/2015-2016.json -j -i",
    file: "./fixtures/2015-2016-solved-import.json"
}, {
    msg: "generate valid template for export",
    cmd: "./index.js schedule ./fixtures/2015-2016.json -j -o",
    file: "./fixtures/2015-2016-solved-export.json"
}, {
    msg: "generate valid schedule to import with content",
    cmd: "./index.js schedule ./fixtures/2015-2016-tagged.json -j -i",
    file: "./fixtures/2015-2016-tagged-solved-import.json"
}, {
    msg: "fix issue #1 - univocally determine whether a moment is in a lecture or another (no overlaps)",
    cmd: "./index.js schedule fixtures/2015-2016-issue-1.json",
    file: "./fixtures/2016-2016-issue-1-fixed.txt"

}];

describe("#json", function () {
    _.map(jsonTest, function (j) {
        var q = j;
        it("should " + q.msg + " [ rm -f " + q.file + " && " + q.cmd + " > " + q.file + " ] ", function () {
            var f = fs.readFileSync(q.file, "utf8");
            return exec(q.cmd).should.eventually.equal(f);
        });
    });
});
