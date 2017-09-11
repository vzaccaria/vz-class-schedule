/* eslint quotes: [0], strict: [0], callback-return: 2, no-use-before-define: 2 */
let {
    $d, $o, $f, $fs, _, $b
} = require('zaccaria-cli');

let et = require('easy-table');

let {
    produceExcel, produceJsonForImport
} = require('./lib/xlsx');

let {
    produceStats, produceSolution, produceNotes, produceContentTemplate
} = require('./lib/slots');

let getOptions = doc => {
    "use strict";

    let o = $d(doc);
    let help = $o('-h', '--help', false, o);
    let program = $o('-p', '--program', undefined, o);
    let problem = o.PROBLEM;
    let schedule = o.schedule;
    let googlecal = $o('-g', '--googlecal', false, o);
    let xlsx = $o('-x', '--xlsx', false, o);
    let json = $o('-j', '--json', false, o);
    let imprt = $o('-i', '--import', false, o);
    let output = $o('-o', '--export', false, o);

    return {
        help, problem, program, schedule, googlecal, xlsx, json, imprt, output
    };
};

// gcalcli --calendar "ZaccariaInfoB1516" --title "Informatica B" --where "L01" --when "10/6/2015 13:15" --duration 120 --description 'xyz' --reminder 30 add --nocache

function produceGoogleCalEntry(it) {
    let dsc = "normale";
    if (_.contains(it.tag, 'lab')) {
        dsc = "laboratorio";
    }
    let cli = `gcalcli --when "${it.gDate}" --calendar "${this.calendar}" --title "${this.title} in aula ${it.aula}" --where "${it.gAddress}" --duration ${it.gDuration} --description "${dsc}" --reminder "60" add --nocache`;
    console.log(cli);
}

let main = () => {
    $fs.readFileAsync(__dirname + '/docs/usage.md', 'utf8').then(it => {
        let {
            help, problem, schedule, googlecal, xlsx, json, imprt, output
        } = getOptions(it);
        if (help) {
            console.log(it);
        } else {
            if (schedule) {
                $b.all([$fs.readFileAsync(problem, 'utf8')]).then(res => {
                    let prob = res[0];
                    prob = JSON.parse(prob);
                    let sol = produceSolution(prob);
                    let stats = produceStats(prob, sol);
                    let notes = produceNotes(prob);
                    if (googlecal) {
                        _.map(sol, produceGoogleCalEntry, prob);
                    } else {
                        if (xlsx) {
                            produceExcel(sol, `${problem}.xlsx`, prob);
                        } else {
                            if (json) {
                                let all = {
                                    solutions: sol,
                                    statistics: stats,
                                    notes: notes
                                };
                                if (output) {
                                    console.log(JSON.stringify(produceContentTemplate(sol), 0, 4));
                                } else if (imprt) {
                                    console.log(JSON.stringify(produceJsonForImport(sol, prob), 0, 4));
                                } else {
                                    console.log(JSON.stringify(all, 0, 4));
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
