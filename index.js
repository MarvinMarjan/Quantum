import Terminal from "./modules/terminal.js";
import fs from "fs"
import getCommand from "./cli.js";
import error from "./modules/err.js";

// terminal class instantiation
let terminal = new Terminal("Terminal");

async function getFile(argv) {
    const encoding = "utf-8";
    let file = await fs.promises.readFile(argv[2], encoding);

    return file;
}

const regex = {
    functions: {
        getFunc: /(\w+)\(/,

        printArgs: /(?:"(.*?)")?(\d+)?/gm // print("hello, world") --> g1: print(" -=-=-=-=- "), g2: hello, world
    },

    keywords: {
        getKeyWord: /^\w+/gm,

        var: /^(?:\w+)\s(\w+)\s?=\s?(.+)/gm
    }
}

const file = await getFile(getCommand());

let line = file.match(regex.functions.print);
line = line.input.split("\n");

let index = 0;

while (line[index] !== undefined) {
    try {
        let funcLine = line[index].match(regex.functions.getFunc);
        let keyword = line[index].match(regex.keywords.getKeyWord);

        console.log(keywLine);

        //console.log("Match line: " + matchLine)
        
        if (line[index] == false) { // empty line
            index++;
            continue;
        }

        if (regex.functions.getFunc.test(funcLine) && funcLine[1] === "print") {
            try {
                let func = funcLine.input.match(regex.functions.printArgs);
            
                let string = "";
                
                for (let i = 0; i < func.length; i++) {
                    if (func[i] == false) {
                        func.splice(i, 0);
                        continue;
                    }

                    // removes the " in func if contains it
                    for (let o = (func[i].indexOf("\"") === -1 ) ? 0 : 1; o < func[i].length - ((func[i].indexOf("\"") === -1) ? 0 : 1); o++) {
                        if (func[i].indexOf("\"") === -1) {
                            string += func[i];
                            break;
                        }

                        string += func[i][o];
                        
                    }
                }

                func = string;

                terminal.print(func);
            }

            catch(err) {
                error(err);
            }
        }

        else if (regex.functions.getFunc.test(funcLine) && funcLine[1] === "clear") {
            terminal.clear();
        }

        index++;
    }

    catch(err) {
        error(err);
    }
}