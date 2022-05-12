// Classes
import Terminal from "./modules/terminal.js";
import Var from "./modules/var.js";

// Functions
import getCommand from "./cli.js";
import error from "./modules/err.js";

// node js
import fs from "fs";

// terminal class instantiation
const terminal = new Terminal("Terminal");

// get the source code file
async function getFile(argv) {
    const encoding = "utf-8";
    let file = await fs.promises.readFile(argv[2], encoding);

    return file;
}

// removes " from strings
function qtRemove(str) {
    let string = "";

    for (let o = (str.indexOf("\"") === -1 ) ? 0 : 1; o < str.length - ((str.indexOf("\"") === -1) ? 0 : 1); o++) {
        if (str.indexOf("\"") === -1) {
            string += str[o];
        }

        else {
            string += str[o];
        }
    }

    return string; // a string without quotes "
}

// returns true if the variable passed as an argument exists
function varExists(v) {
    return (vars[v] === undefined) ? false : true;
}

// returns the type of the variable according to the value
function getType(v) {
    let auxRegex = {
        number: /\d+$/,
        float: /\d+\.\d+$/
    }

    let type;

    if (v[3] === "true" || v[3] === "false") {
        type = "boolean";
    }

    else if (v[3][0] === "\"" && v[3][v[3].length - 1] === "\"") {
        type = "string";
    }

    else if (auxRegex.float.test(v.input)) {
        type = "float";
    }

    else if (auxRegex.number.test(v.input)) {
        type = "number";
    }

    // type doesn't exist
    else {
        error("type is undefined");
    }

    return type;
}

function getVar(name) {
    let varObj = {
        name: vars[name].name,
        value: vars[name].value,
        type: vars[name].type
    }

    return varObj;
}

// an object containing the regexs that are used
const regex = {
    // function regexs
    functions: {
        getFunc: /(\w+)\(/m,

        // get all args
        getArgs: /(?:"(.*?)")?(\d+)?(\$\w+\.?\w+)?/gm
    },

    // keywords regexs
    keywords: {
        getKeyWord: /^\w+/gm,

        // detect a var creation
        var: /^(?:\w+)\s(\w+)\s?(=)\s?(.+)/gm,

        // var reassignment
        varRTB: /^(?:\$)(\w+)\s?(=)\s?(.+)$/m,
        varProp: /(\w+)?/gm
    }
}

// source file
const file = await getFile(getCommand());

// an object containing all the variables
let vars = {};

// each line
let line = file.match(regex.functions.print);
line = line.input.split("\n");

// line index
let index = 0;

// until the file ends
while (line[index] !== undefined) {
    let funcLine = line[index].match(regex.functions.getFunc);
    let keyword = line[index].match(regex.keywords.getKeyWord);

    // detects a reassignment of a variable
    if (regex.keywords.varRTB.test(line[index])) {
        var varRTB_ln = line[index].match(regex.keywords.varRTB);

        if (varExists(varRTB_ln[1])) {
            vars[varRTB_ln[1]].value = qtRemove(varRTB_ln[3]);
        }

        else {
            error(`${varRTB_ln[1]} is undefined`);
        }
    }

    // empty line
    if (line[index] == false) {
        index++;
        continue;
    }

    // detect if the keyword is "var"
    if (regex.keywords.getKeyWord.test(line[index]) && keyword[0] === "var") {
        let varLine = line[index].match(regex.keywords.var);
        varLine = regex.keywords.var.exec(varLine);

        if (varLine[2] === "=") {
            let type = getType(varLine);

            // new var
            let varObj = new Var(varLine[1], type, varLine[3])

            //save var
            vars[varObj.name] = varObj;
        }
    }
    
    // detect if the function is "print"
    if (regex.functions.getFunc.test(funcLine) && funcLine[1] === "print") {
        let args = funcLine.input.match(regex.functions.getArgs);

        let varName;
        let string = "";
        
        for (let i = 0; i < args.length; i++) {
            varName = undefined;

            if (args[i] == false) {
                args.splice(i, 0);
                continue;
            }

            // the argument is a variable
            if (args[i].indexOf("$") === 0) {
                if (regex.keywords.varProp.test(args[i])) {
                    let prop = args[i].match(regex.keywords.varProp);

                    prop.forEach((v, i) => {
                        if (v == false) {
                            prop.splice(i, 1)
                        }
                    })

                    let aux = getVar(prop[0]);

                    let tempVar = new Var(aux.name, aux.type, aux.value);

                    string += Var.getProp(prop, tempVar.prop);
                    continue;
                }

                else {
                    varName = args[i].substring(1);
                }
            }

            if (varName) {
                try {
                    string += qtRemove(getVar(varName).value);
                    varName = null;
                }

                catch {
                    if (!varExists(varName)) {
                        error(`${varName} is undefined`)
                    }
                }
            }

            string += (varName) ? "" : (varName !== undefined) ? "" : qtRemove(args[i]);
            
        }

        args = string;

        terminal.print(args);
    }

    // detect if the function is "clear"
    else if (regex.functions.getFunc.test(funcLine) && funcLine[1] === "clear") {
        terminal.clear();
    }

    // next line
    index++;
}
