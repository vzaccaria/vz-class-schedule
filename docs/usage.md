Usage:
    autoprog schedule PROBLEM [ -g ] [ -x ] [ -j [ -i | -o ] ]
    autoprog ( -h | --help )

Options:
    -h, --help                  help for autoprog
    -g, --googlecal             generate commands to send data to google cal
    -x, --xlsx                  generate an excel file of the schedule
    -j, --json                  generate a json file of the schedule
    -i, --import                format as import
    -o, --export                generate a snippet of json to be filled up with content

Commands:
    schedule                create a schedule from the problem

Arguments:
    PROBLEM                 json file to be used as a problem def.

Description:
    When importing data (-j -i options), remember to fill:

    - c_forma_didattica (1 - Lezione, 13 - Altra attivita')
