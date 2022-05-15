// Classes
import Terminal from "./modules/terminal.js";
import Var from "./modules/var.js";
import NumExp from "./modules/numexp.js"
import Condition from "./modules/condition.js";

// Functions
import getCommand from "./cli.js";
import error from "./modules/err.js";

// node js
import fs from "fs";
import { exec } from "child_process";

// terminal class instantiation
const terminal = new Terminal("Terminal");

// get the source code file
async function getFile(argv) {
    const encoding = "utf-8";
    let file = await fs.promises.readFile(argv, encoding);

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

    v = ["", "", "", v]; // bug solve

    let type;

    if (v[3] === "true" || v[3] === "false") {
        type = "boolean";
    }

    else if (v[3][0] === "\"" && v[3][v[3].length - 1] === "\"") {
        type = "string";
    }

    else if (auxRegex.float.test(v[3])) {
        type = "float";
    }

    else if (auxRegex.number.test(v[3])) {
        type = "number";
    }

    // type doesn't exist
    else {
        v[3] = "\"" + v[3] + "\"";
        type = "string";
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

function condRetn(line, array) {
    let aux = line.match(regex.identifiers.condition);

    let result = new Condition(aux[1]);
    
    array[3] = String((result.return));

    return array;
}

function concatArgs(funcLine) {
    let args = funcLine.input.match(regex.functions.getFull);
    args = args[1];
    args = args.match(regex.functions.getArgs);

    let varName;
    let string = "";

    // detect a numeric expression
    args.forEach((v, i) => {
        if (regex.identifiers.numExp.test(v)) {
            let aux = regex.identifiers.numExp.exec(v);
            let result = new NumExp(aux[1]);

            args[i] = String(result.result);
        }

        if(regex.identifiers.condition.test(v)) {
            let aux = regex.identifiers.condition.exec(v);
            let result = new Condition(aux[1]);

            args[i] = String(result.return);
        }
    });
    
    for (let i = 0; i < args.length; i++) {
        varName = undefined;

        if (args[i] == false) {
            args.splice(i, 0);
            continue;
        }

        // the argument is a variable
        if (args[i].indexOf("$") === 0) {
            if (regex.keywords.varProp.test(args[i]) && args[i].indexOf(".") !== -1) {
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

    return string;
}

// an object containing the regexs that are used
const regex = {
    // function regexs
    functions: {
        getFunc: /(\w+)\(/m,

        // get all args
        getArgs: /(?:"(.*?)")?(\.?\d+\.?)?(\$\w+\.?\w+)?(true|false)?(<(.*?)>)?(\((.+?)\))?/gm,

        // get everything between parenthesis
        getFull: /\((.*)\)/m
    },

    identifiers: {
        // get a numExpression
        numExp: /<(.*?)>/m,
        condition: /\((.+)\)/m
    },

    // keywords regexs
    keywords: {
        getKeyWord: /^\w+/gm,

        // detect a var creation
        var: /^(?:\w+)\s(\w+)\s?(=)\s?(.+)/gm,

        // var reassignment
        varRTB: /^(?:\$)(\w+)\s?(=)\s?(.+)$/m,

        // gets var propertys
        varProp: /(\w+)?/gm,

        // contains var
        varIn: /\$(\w+)/gm,
    }
}

// source file
const file = await getFile(getCommand());

// an object containing all the variables
let vars = {};

// each line
let line = file.match(regex.functions.print);

// a bug solve
line.input += "\\n";

// separating lines
line = line.input.split("\n");

// line index
let index = 0;

main(line, index);

// until the file ends
function main(line, index, ignore=null) {
    while (line[index] !== undefined) {
        let funcLine = line[index].match(regex.functions.getFunc);
        let keyword = line[index].match(regex.keywords.getKeyWord);
    
        // detects a reassignment of a variable
        if (regex.keywords.varRTB.test(line[index])) {
            var varRTB_ln = line[index].match(regex.keywords.varRTB);
    
            if (varExists(varRTB_ln[1])) {
                if (regex.identifiers.condition.test(varRTB_ln)) {
                    vars[varRTB_ln[1]].value = String(condRetn(varRTB_ln.input, varRTB_ln)[3]);
                }

                else {
                    vars[varRTB_ln[1]].value = qtRemove(varRTB_ln[3]);
                }

                vars[varRTB_ln[1]].type = getType(varRTB_ln[3]);
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
                if (regex.identifiers.numExp.test(varLine.input)) {
                    let exp = varLine.input.match(regex.identifiers.numExp)
                    
                    if (regex.keywords.varIn.test(varLine.input)) {
                        let varExp = varLine.input.match(regex.keywords.varIn);
                        let aux = regex.identifiers.numExp.exec(varLine[3]);
                        let rplcExp = aux[1];
    
                        for (let i = 0; i < varExp.length; i++) {
                            varExp.forEach((v, i) => {
                                let auxVar = getVar(varExp[i].substring(1));
                                let tempRegex = new RegExp("\\" + v, "g");
    
                                rplcExp = rplcExp.replace(tempRegex, auxVar.value);
                            });
    
                            exp[1] = `${rplcExp}`
                        }
                    }
    
                    let numExp = new NumExp(exp[1]);
    
                    varLine[3] = String(numExp.result); // varLine[3] is the var value index
                }

                else if (regex.identifiers.condition.test(varLine.input)) {
                    varLine = condRetn(varLine.input, varLine);
                }
    
                let type = getType(varLine[3]);
    
                // new var
                let varObj = new Var(varLine[1], type, varLine[3])
    
                //save var
                vars[varObj.name] = varObj;
            }
        }
        
        // if keyword
        else if (((keyword !== null) ? keyword[0] : "") === "if") {
            // gets the condition
            let cond = regex.identifiers.condition.exec(line[index]);

            // true || false
            let retn = new Condition(cond[1]);
    
            while (typeof retn.return[0] === "object") {
                retn.return = [...retn.return[0]];
            }

            retn.return = retn.return[0];
            
            // detect the code block
            if (retn.return && line[index][line[index].length - 2] === "{") {
                index++ // new line
                let auxIndex = 0;
                let blockLine;
                let block = [];

                // get all lines inside the block
                blockLine = line.filter((v, i) => {
                    if (i >= index && v !== "}") {
                        return true;
                    }

                    else {
                        return false;
                    }
                });

                // remove indentation
                blockLine.forEach(v => {
                    block.push(v.trimStart());
                })

                // executes the same function  main() running now, but for the code block
                auxIndex = main(block, auxIndex, "if");

                index = auxIndex + index;
            }

            else {
                for (let i = index; i < line.length; i++) {
                    if (line[i][0] === "}") {
                        break;
                    }

                    else {
                        index++
                    }
                }
            }
        }
        
        // detect if the function is "print"
        if (regex.functions.getFunc.test(funcLine) && funcLine[1] === "print") {
            
            let string = concatArgs(funcLine);
    
            let args = string;
    
            terminal.print(args);
        }
    
        // detect if the function is "clear"
        else if (regex.functions.getFunc.test(funcLine) && funcLine[1] === "clear") {
            terminal.clear();
        }
    
        else if(regex.functions.getFunc.test(funcLine) && funcLine[1] === "exec") {
            let aux = concatArgs(funcLine)//.input.match(regex.functions.getFull);

            exec(aux);
        }
    
        // next line
        index++;
    }

    return index;
}

export {qtRemove, getType};