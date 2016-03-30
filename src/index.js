/* eslint quotes: [0], strict: [0], callback-return: 2, no-use-before-define: 2 */
var {
    $d, $o, $f, $fs, _, $b
} = require('zaccaria-cli')

var et = require('easy-table')

var { produceExcel } = require('./lib/xlsx')

var {
    produceStats, produceSolution, produceNotes
} = require('./lib/slots')


var getOptions = doc => {
    "use strict"
    var o = $d(doc)
    var help = $o('-h', '--help', false, o)
    var program = $o('-p', '--program', undefined, o)
    var problem = o.PROBLEM
    var schedule = o.schedule
    var googlecal = $o('-g', '--googlecal', false, o)
    var xlsx = $o('-x', '--xlsx', false, o)
    return {
        help, problem, program, schedule, googlecal, xlsx
    }
}

// gcalcli --calendar "ZaccariaInfoB1516" --title "Informatica B" --where "L01" --when "10/6/2015 13:15" --duration 120 --description 'xyz' --reminder 30 add --nocache

function produceGoogleCalEntry(it) {
    var dsc = "normale"
    if (_.contains(it.tag, 'lab')) {
        dsc = "laboratorio"
    }
    var cli = `gcalcli --when "${it.gDate}" --calendar "${this.calendar}" --title "${this.title} in aula ${it.aula}" --where "${it.gAddress}" --duration ${it.gDuration} --description "${dsc}" --reminder "60" add --nocache`
    console.log(cli)
}


var main = () => {
    $f.readLocal('docs/usage.md').then(it => {
        var {
            help, problem, schedule, googlecal, xlsx
        } = getOptions(it);
        if (help) {
            console.log(it)
        } else {
            if (schedule) {
                $b.all([
                    $fs.readFileAsync(problem, 'utf8')
                ]).then((res) => {
                    var prob = res[0]
                    prob = JSON.parse(prob)
                    var sol = produceSolution(prob)
                    var stats = produceStats(prob, sol)
                    var notes = produceNotes(prob)
                    if (!googlecal && !xlsx) {
                        console.log(et.print(sol))
                        console.log(et.print(stats))
                        console.log(et.print(notes))
                    } else {
                        if(googlecal) {
                            _.map(sol, produceGoogleCalEntry, prob)
                        }
                        if(xlsx) {
                            produceExcel(sol, `${problem}.xlsx`, prob);
                        }
                    }
                })
            }
        }
    })
}

main()
