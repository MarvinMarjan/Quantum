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
import os from "os"

/*let test = os.networkInterfaces();

console.log(test);*/

// terminal class instantiation
const terminal = new Terminal("Terminal");

/**
 * opens a file and returns its contents
 * 
 * @param {*} argv file path 
 * @returns file content
 */

async function getFile(argv) {
    const encoding = "utf-8";
    let file = await fs.promises.readFile(argv, encoding);

    return file;
}

/**
 * remove quotes from a string
 * 
 * @param {*} str string to remove quotes
 * @returns a string with quotes removed
 */
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

/**
 * detects if a variable exists
 * 
 * @param {*} v the var name
 * @returns true if the variable exists
 */
function varExists(v) {
    return (vars[v] === undefined) ? false : true;
}

/**
 * returns the type of a variable
 * 
 * @param {*} v var name
 * @returns 
 */
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

/**
 * returns an object containing the data of a variable
 * 
 * @param {*} name var name
 * @returns var name, var value, var type
 */
function getVar(name) {
    let varObj = {
        name: vars[name].name,
        value: vars[name].value,
        type: vars[name].type
    }

    return varObj;
}

/**
 * returns an array containing the lines of a code block
 * 
 * @param {*} line line array
 * @param {*} index line index
 * @returns block lines
 */
function getBlock(line, index) {
    let blockLine;
    let block = [];

    // get all lines inside the block
    blockLine = line.filter((v, i) => {
        if (i >= index && v[0] !== "}") {
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

    return block;
}

/**
 * this function is used in the assignment of a variable, 
 * if there is a condition in the value of the variable this 
 * function will change the condition to true or false, depending.
 * 
 * @param {*} line line where the function goes looking for the condition
 * @param {*} array an array containing the space-separated line for the exchange of values
 * @returns an array with the exchanged values
 */
function condRetn(line, array) {
    let aux = line.match(regex.identifiers.condition);

    let result = new Condition(aux[1]);
    
    array[3] = String((result.return));

    return array;
}

/**
 * concatenates all arguments of a function
 * 
 * @param {*} funcLine a line containing a function
 * @returns all function arguments concatenated
 */
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

/**
 * ignore a block of code
 * 
 * @param {*} index current index
 * @param {*} line code block lines
 * @returns an index whose all lines have been skipped
 */
function ignoreBlock(index, line) {
    for (let i = index; i < line.length; i++) {
        if (line[i][0] === "}") {
            break;
        }

        else {
            index++
        }
    }

    return index;
}

/**
 * an object containing all the regexs used in the code
 */
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

// ========================================== global vars ============================================

/**
 * source file
 */
const file = await getFile(getCommand());

/**
 * an object containing all variables
 */
let vars = {};

/**
 * "else" use this
 * 
 * @example 
 * 
 * if (2 == 2) {
 *     print("equals 2")
 * }
 * 
 * // auxCond receives the value
 * // of the previous condition
 * // this way we can know if the
 * // previous condition was false or true
 * else {
 *     print("false")
 * }
 */
let auxCond;

/**
 * a string containing the file content
 */
let line = file.match(regex.functions.print);

/*
  add a line break at the 
  end of the file to solve a problem
 */
line.input += "\\n";

// separating file lines
line = line.input.split("\n");

// line index
let index = 0;

main(line, index);

/**
 * this function runs the entire program,
it is inside a function to be reused in code blocks
 */
function main(line, index) { // ====================================== main ========================================
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

            if (cond[1][0] === "$") {
                let varName = regex.keywords.varIn.exec(cond[1]);

                cond[1] = getVar(varName[1]).value;
            }

            // true || false
            let retn = new Condition(cond[1]);
    
            while (typeof retn.return[0] === "object") {
                retn.return = [...retn.return[0]];
            }

            retn.return = retn.return[0];
            
            // detect the code block
            if (retn.return && line[index][line[index].length - 2] === "{") {
                auxCond = true;
                index++ // new line
                let auxIndex = 0;
                let block = getBlock(line, index);

                // executes the same function  main() running now, but for the code block
                auxIndex = main(block, auxIndex);

                index = auxIndex + index;
            }

            else {
                index = ignoreBlock(index, line);
            }
        }

        else if (((keyword !== null) ? keyword[0] : "") === "else") {
            if (line[index][line[index].length - 2] === "{" && !auxCond) {
                index++; //new line
                let block = getBlock(line, index);
                let auxIndex = 0;

                auxIndex = main(block, auxIndex);

                index = auxIndex + index;
                auxCond = undefined;
            }

            else {
                index = ignoreBlock(index, line);
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

        /*else if(regex.functions.getFunc.test(funcLine) && funcLine[1] === "ip") {
            let args = regex.functions.getFull.exec(funcLine);
            args = regex.functions.getArgs.exec(args);

            console.log(args);
        }*/
    
        // next line
        index++;
    }

    return index;
}

export {qtRemove, getType};