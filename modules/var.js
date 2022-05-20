import { qtRemove } from "../index.js";

class Var {
    constructor(name, type, value) {
        this.name = name;
        this.type = type;
        this.value = value;

        this.prop = {
            type: this.type,
            name: this.name
        };

        if (this.prop.type === "string") {
            this.prop.length = qtRemove(this.value).length
        }
    }

    /**
     * return a var property
     * 
     * @param {*} prop 
     * @param {*} targProp 
     * @returns 
     */
    static getProp(prop, targProp) {
        function through(obj) {
            for (let v in obj) {
                if (v === prop[i]) {
                    if (typeof v === "object") {
                        i++;
                        through(v)
                    }

                    else {
                        return v;
                    }
                }
            }
        }

        let i = 1;

        for (let item in targProp) {
            if (item === prop[i]) {
                if (typeof item === "object") {
                    i++;
                    return through(item);
                }

                else {
                    return targProp[item];
                }
            }
        }
    }
}

export default Var;