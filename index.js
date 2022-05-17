/**
 * @copyright all rights reserved
 */

// Classes
import Terminal from "./modules/terminal.js";
import Var from "./modules/var.js";
import NumExp from "./modules/numexp.js"
import Condition from "./modules/condition.js";
import Ip from "./modules/ip.js"
import File from "./modules/file.js"

// Functions
import getCommand from "./cli.js";
import error from "./modules/err.js";

// node js
import fs from "fs";
import { exec } from "child_process";

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
function formatArgs(funcLine, mode="concat", ignore=false) {
    let string = "";
    let varName;

    funcLine = funcLine.map(String);

    // detect a numeric expression
    funcLine.forEach((v, i) => {
        if (regex.identifiers.numExp.test(v) && !ignore) {
            let aux = regex.identifiers.numExp.exec(v);
            let result = new NumExp(aux[1]);

            funcLine[i] = String(result.result);
        }

        if(regex.identifiers.condition.test(v) && !ignore) {
            let aux = regex.identifiers.condition.exec(v);
            let result = new Condition(aux[1]);

            funcLine[i] = String(result.return);
        }
    });

    
    for (let i = 0; i < funcLine.length; i++) {
        varName = undefined;

        if (funcLine[i] == false) {
            funcLine.splice(i, 0);
            continue;
        }

        // the argument is a variable
        if (funcLine[i].indexOf("$") === 0) {
            if (regex.keywords.varProp.test(funcLine[i]) && funcLine[i].indexOf(".") !== -1) {
                let prop = funcLine[i].match(regex.keywords.varProp);

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
                varName = funcLine[i].substring(1);
            }
        }

        if (varName) {
            try {
                if (mode === "concat") {
                    string += qtRemove(getVar(varName).value);
                }

                else if (mode === "format") {
                    funcLine[i] = qtRemove(getVar(varName).value);
                }

                varName = null;
            }

            catch {
                if (!varExists(varName)) {
                    error(`${varName} is undefined`)
                }
            }
        }

        string += (varName) ? "" : (varName !== undefined) ? "" : (!ignore) ? qtRemove(funcLine[i]) : funcLine[i];
    }

    if (mode === "concat") {
        string = (!ignore) ? escapeChar(string) : string;
        return string;
    }

    else if(mode === "format") {
        let retr = funcLine.map(escapeChar)

        return retr;
    }
}

/**
 * looks for escape characters in a string and returns the string formatted according to the escape characters
 * 
 * @param {*} str string to search
 * @returns formated string
 */
function escapeChar(str) {
    let ret = str
    let char = "";

    for (let i = 0; i < ret.length; i++) {
        if (ret[i] === "\\") {
            if (ret[i + 1] === "n") {
                char = ret.replace("\\n", "\n");
            }

            else if (ret[i + 1] === "t") {
                char = ret.replace("\\t", "\t");
            }

            else if (ret[i + 1] === "\\") {
                char = ret.replace("\\", "\\");
            }
        }
    }

    if (char == false) {
        return ret;
    }

    else {
        return char;
    }
}

/**
 * returns an array of objects containing functions that were found in the parameters of the parent function
 * 
 * @param {*} arg an array containing all the arguments of the function
 * @returns an array of objects
 */
function findFuncArg(arg) {
    let indexes = [];

    arg.forEach((v, i) => {
        if (regex.functions.getFunc.test(v)) {
            if (v[0] === "(") {
                indexes.push({
                    func: v.substring(1, v.length - 1),
                    index: i
                });
            }

            else {
                indexes.push({
                    func: v,
                    index: i
                });
            }
        }
    });

    return indexes;
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
 * remove all blank items from an array
 * 
 * @param {*} array array items to remove
 * @returns array with blank items removed
 */
function removeNull(array) {
    return array.filter(v => {
        if (v != false) {
            return true;
        }

        else {
            return false;
        }
    });
}

/**
 * handling assignment and reassignment of variables
 * 
 * @param {*} varLine the line containing the assignment or reassignment of a variable
 */
function varATB(varLine) {
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

    // ======================== 
    else if (regex.functions.getFunc.test(varLine.input)) {
        let funcName = regex.functions.getFunc.exec(varLine.input);
        let args = regex.functions.getFull.exec(funcName[0]);

        if (funcName[1] === "ip") {
            let maxArgs = 1;
            let strArg = "";
            args = args[1].match(regex.functions.getArgs);

            args = removeNull(args);

            args.forEach((v, i) => {
                if (i <= maxArgs - 1) {
                    strArg += v;
                }
            });

            strArg = qtRemove(strArg);

            varLine[3] = returnFuncs.ip.get(strArg);
        }

        else if (funcName[1] === "file") {
            args = args[1].match(regex.functions.getArgs);
            let qtRmdArgs = args.map(qtRemove);

            let concat = formatArgs(args);

            qtRmdArgs = removeNull(qtRmdArgs)

            if (qtRmdArgs[0] === "read") {
                varLine[3] = returnFuncs.file.read(qtRmdArgs[1]);
            }

            else if (qtRmdArgs[0] === "write") {
                varLine[3] = returnFuncs.file.write(qtRmdArgs[1], qtRmdArgs[2]);
            }
        }
    }

    else if (regex.identifiers.condition.test(varLine.input) ) {
        varLine = condRetn(varLine.input, varLine);
    }

    else if (regex.identifiers.sysArg.test(varLine.input)) {
        let arg = regex.identifiers.sysArg.exec(varLine.input);

        varLine[3] = process.argv[Number(arg[1]) + 2];
    }

    let type = getType(varLine[3]);

    // new var
    let varObj = new Var(varLine[1], type, varLine[3])

    //save var
    vars[varObj.name] = varObj;
    index++;
}

/**
 * an object containing all the regexs used in the code
 */
const regex = {
    // function regexs
    functions: {
        getFunc: /(\w+)\(.*\)/m,

        // get all args
        getArgs: /(?:"(.*?)")?(\.?\d+\.?)?(\$\w+\.?\w+)?(true|false)?(<(.*?)>)?(\w+\(.+?\))?/gm,

        // get everything between parenthesis
        getFull: /\((.*)\)/m
    },

    identifiers: {
        // get a numExpression
        numExp: /<(.*?)>/m,
        condition: /\((.+)\)/m,
        sysArg: /%(\d+)/m
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
        varIn: /\$(\w+)/m,
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
 * an object containing all functions that return some value
 */
let returnFuncs = {
    /**
     * ip manipulation
     */
    ip: {
        /**
         * @param {*} type ip type to return
         * @returns ip
         */
        get: function(type) {
            let ip = new Ip(type);

            return ip.return;
        },

        args: 1
    },

    /**
     * file manipulation
     */
    file: {
        /**
         * reads a file and returns its contents
         * 
         * @param {*} path the path to the file
         * @returns file content
         */
        read: function(path) {
            let file = new File("read", path);

            return file.return;
        },

        /**
         * write or create a file
         * 
         * @param {*} path the path to the file
         * @param {*} data the content to be written to the file
         * @returns true if no error has occurred
         */
        write: function(path, data) {
            let file = new File("write", path, data);

            return file.return;
        },

        rArgs: 2,
        wArgs: 3
    }
}

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
                varATB(varLine);
            }
        }
        
        // if keyword
        else if (((keyword !== null) ? keyword[0] : "") === "if") {
            // gets the condition
            let cond = regex.identifiers.condition.exec(line[index]);

            cond = cond[1].split(" ");    

            cond.forEach((v, i) => {
                if (regex.keywords.varIn.test(v)) {
                    let varName = regex.keywords.varIn.exec(v);

                    cond[i] = getVar(varName[1]).value;
                }
            });

            // true || false
            let retn = new Condition(cond.join(" "));
    
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
            let funcName = regex.functions.getFunc.exec(funcLine);
            let full = regex.functions.getFull.exec(funcLine);
            let args = full[1].match(regex.functions.getArgs);

            if (findFuncArg(args) != false) {
                let indexes = findFuncArg(args);
    
                indexes.forEach((v, i) => {
                    let auxName = regex.functions.getFunc.exec(v.func);
                    let auxArgs = regex.functions.getFull.exec(v.func);
                    auxArgs = auxArgs[1].match(regex.functions.getArgs);
    
                    if (auxName[1] === "ip") {
                        let total = "";
    
                        for (let o = 0; o < returnFuncs.ip.args; o++) {
                            total += qtRemove(auxArgs[o]);
                        }
    
                        args[i] = returnFuncs.ip.get(total);
                    }

                    else if (auxName[1] === "file") {
                        let auxArgs = regex.functions.getFull.exec(auxName[0]);
                        auxArgs = auxArgs[1].match(regex.functions.getArgs);

                        let qtRmdArgs = removeNull(auxArgs.map(qtRemove));

                        if (qtRmdArgs[0] === "write") {
                            qtRmdArgs[2] = formatArgs([qtRmdArgs[2]], "format", true)[0]
                            args[i] = returnFuncs.file.write(qtRmdArgs[1], qtRmdArgs[2]);
                        }

                        else if(qtRmdArgs[0] === "read") {
                            qtRmdArgs[1] = formatArgs([qtRmdArgs[1]], "format", true)[0]
                            args[i] = returnFuncs.file.read(qtRmdArgs[1]);
                        }
                    }
                })
            }

            let string = formatArgs(args, "concat", true);
    
            let aux = string;
    
            terminal.print(aux);
        }
    
        // detect if the function is "clear"
        else if (regex.functions.getFunc.test(funcLine) && funcLine[1] === "clear") {
            terminal.clear();
        }
    
        else if (regex.functions.getFunc.test(funcLine) && funcLine[1] === "exec") {
            let aux = regex.functions.getFull.exec(funcLine[0]);
            aux = formatArgs(aux[1].match(regex.functions.getArgs))//.input.match(regex.functions.getFull);

            exec(aux);
        }

        else if (regex.functions.getFunc.test(funcLine) && funcLine[1] === "file") {
            let args = regex.functions.getFull.exec(funcLine[0]);
            args = args[1].match(regex.functions.getArgs);

            let qtRmdArgs = args.map(qtRemove);

            qtRmdArgs = removeNull(qtRmdArgs);

            if (qtRmdArgs[0] === "write") {
                qtRmdArgs[2] = formatArgs([qtRmdArgs[2]], "format", true)[0]
                returnFuncs.file.write(qtRmdArgs[1], qtRmdArgs[2]);
            }
        }
    
        // next line
        index++;
    }

    return index;
}

export {qtRemove, getType};