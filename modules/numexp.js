class NumExp {
    constructor(exp) {
        this.result = this.solveExp(exp);
    }

    solveExp(exp="") {
        let regex = {
            getOrder: /\[(.+)\]/m,
            getMath: /(\d+)?\s?(\+|-|\*|\/)\s?(\d+)/gm
        }

        let haveOrder = false;
        let order;
        let exps;

        if (regex.getOrder.test(exp)) {
            haveOrder = true;
            order = exp.match(regex.getOrder);
            exps = order[1].match(regex.getMath);

            exps.forEach((v, i) => {
                exps[0] += (i > 0) ? v : "";
    
                if (i > 0) {
                    exps.splice(i);
                }
            });

            exps = exps[0].split(" ");
        }

        else {
            exps = exp.match(regex.getMath);

            if (exps.length > 0) {
                exps.forEach((v, i) => {
                    if (i > 0) {
                        exps[0] += v;
                    }
                });
            }

            exps = exps[0].split(" ");
        }

        let result = 0;

        let operation = "";

        let splitExps = exps;

        splitExps.forEach((v, i) => {
            if (v === "+" || v === "-" || v === "*" || v === "/") {
                operation = (v === "+") ? "more" :
                            (v === "-") ? "less" :
                            (v === "*") ? "mult" :
                            (v === "/") ? "divs" :
                            "NaN";
            }

            else if (i === 0) {
                result = Number(v);
            }

            else if (i > 1 && typeof Number(v) === "number") {
                result = (operation === "more") ? result + Number(v) :
                        (operation === "less") ? result - Number(v) :
                        (operation === "mult") ? result * Number(v) :
                        (operation === "divs") ? result / Number(v) :
                        0;
            }
        });

        if (haveOrder) {
            let auxExp = exp.replace(regex.getOrder, String(result));

            result = this.solveExp(auxExp);

            return result
        }

        else {
            return result;
        }
    }
}

export default NumExp;