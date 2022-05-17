import error from "./err.js";

/**
 * console (Terminal) class
 */ 
class Terminal {
    constructor(name) {
        this.name = "Terminal";
    }

    /**
     * logs in the console a string
     */
    print() {
        try {
            let string = "";

            for (let arg in arguments) {
                string += arguments[arg];
            }

            console.log(string);
        }

        // exception
        catch(err) {
            error(err);
        }
    }

    /**
     * clear the console
     */
    clear() {
        console.clear()
    }
}

export default Terminal;