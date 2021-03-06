# autoprog
> No name given yet

## Install

Install it with

```
npm install autoprog
```
## Usage

```
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

```

## Author

* Vittorio Zaccaria

## License
Released under the BSD License.

***



# New features

-     export contenuto and tipo attivita for registro -- [Apr 2nd 16](../../commit/9ce94c7c11c6087da4b60a1da26bee00b266f9d7)
-     add table -- [Mar 31st 16](../../commit/a071f248ad1a75e6ad2eed9eb37e6c0d4dc23e30)
-     add tests -- [Mar 31st 16](../../commit/5c42518aaaf71e477bd81dca4d27d399a6d1fc74)

# Bug fixes

-     differentiate between types of activity -- [Apr 4th 16](../../commit/52c5b88b69c81aea51b0cfb1d311cfd0227fac34)
-     range overlap and add export option -- [Apr 4th 16](../../commit/67b42cc35b4ed3da2f6b1e8b778033ce07653046)
-     command name -- [Apr 3rd 16](../../commit/a49dbb78f11c960b8a4d642c62d1b321f333f137)
-     update import field names -- [Apr 3rd 16](../../commit/3e0479b934fbe0e3088a1199f2cbca521883a752)
-     propagate codice aula -- [Apr 2nd 16](../../commit/0cbe5fcc78fc5820e12d0d640ddc104df25941c9)
-     usage file path -- [Mar 31st 16](../../commit/c51c59d6963fa2846558cd7ed0b5eb9df09305af)
-     test timeout -- [Mar 31st 16](../../commit/b76a91708cb4f1453eecfa7c4e9e5f8e53d461f0)
