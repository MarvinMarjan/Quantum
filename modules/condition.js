import {qtRemove, getType} from "../index.js"

class Condition {
    constructor(exp) {
        this.return = this.solveCondition(exp)
    }

    solveCondition(exp) {
        function checkCondition() {
            let aux = [];

            auxArray.forEach((v, i) => {
                if (v !== "==" && v !== "!=" && v !== ">" && v !== "<" && v !== ">=" && v !== "<=" && v !== "and" && v !== "or") {
                    switch (typeof v) {
                        case "number":
                            aux.push(Number(v));
                            break;
                        
                        case "string":
                            aux.push(String(v));
                            break;

                        case "boolean":
                            aux.push(Boolean(v));
                            break;
                        
                        default:
                            aux.push("undefined type");
                    }
                }

                else {
                    aux.push(v);
                }
            })

            if (aux[0] === "or" || aux[0] === "and") {
                aux = [];

                auxArray.forEach((v, i) => {
                    if (i > 0) {
                        aux.push(v);
                    }
                })
            }

            switch(aux[1]) {
                case "==":
                    if (aux[0] === aux[2]) {
                        return true;
                    }
    
                    else {
                        return false;
                    }
    
                    break;
                
                case "!=":
                    if (aux[0] !== aux[2]) {
                        return true;
                    }
    
                    else {
                        return false;
                    }
    
                    break;
    
                case ">":
                    if (aux[0] > aux[2]) {
                        return true;
                    }
    
                    else {
                        return false;
                    }
    
                    break;
    
                case "<":
                    if (aux[0] < aux[2]) {
                        return true;
                    }
    
                    else {
                        return false;
                    }
    
                    break;
    
                case ">=":
                    if (aux[0] >= aux[2]) {
                        return true;
                    }
    
                    else {
                        return false;
                    }
    
                    break;
                
                case "<=":
                    if (aux[0] <= aux[2]) {
                        return true;
                    }
    
                    else {
                        return false;
                    }
    
                    break;
                    
                default:
                    console.log("conditional operation is undefined");
                    return "undefined operation";
            }
        }

        function cond(aux=[]) {
            let temp = [aux];

            if (auxArray[0] === undefined) {
                return temp;
            }

            else if (auxArray[0] === "and") {
                let aux = checkCondition();
                temp.push(aux);
                auxArray.splice(0, 4);

                temp = [temp];

                if (auxArray[0] !== undefined) {
                    temp.push(...cond());
                }

                if (temp[0].includes(false)) {
                    temp[0] = false;
                }

                else {
                    temp[0] = true;
                }
            }

            else if (auxArray[0] === "or") {
                let aux = checkCondition();
                temp.push(aux);
                auxArray.splice(0, 4);

                temp = [temp];
                
                if (auxArray[0] !== undefined) {
                    temp.push(...cond());
                }

                temp.forEach((v, i) => {
                    if (temp[i].length > 1) {
                        if (temp[i].includes(true)) {
                            temp[i] = true;
                        }

                        else {
                            temp[i] = false;
                        }
                    }
                });
            }

            return temp;
        }

        let aux = exp.split(" ");
        let type;
        let conditions = [];
        let auxArray = []

        let operations = [
            "equality",
            "opposition",
            "bigger-than",
            "smaller-than",
            "bigger-or-equal-to",
            "smaller-or-equal-to"
        ]

        aux.forEach((v, i) => {
            if (v !== "==" && v !== "!=" && v !== ">" && v !== "<" && v !== ">=" && v !== "<=" && v !== "and" && v !== "or") {

                type = getType(["", "", "", v]);

                let temp;

                switch(type) {
                    case "string":
                        temp = qtRemove(v);
                        break;

                    case "number":
                        temp = Number(v);
                        break;

                    case "boolean":
                        temp = v;
                        break;

                    case "float":
                        temp = v;
                        break;
                }

                auxArray.push(temp);
            }

            else {
                auxArray.push(v);
            }
        });

        let auxReturn = [checkCondition()];

        auxArray.splice(0, 3);

        if (auxArray[0] === undefined) {
            conditions.push(auxReturn)
            return conditions;
        }

        conditions.push(cond(auxReturn[0]));

        return conditions;
    }
}

export default Condition;