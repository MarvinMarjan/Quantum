import fs from "fs"
import chalk from "chalk";
import readline from "readline"
import { exec } from "child_process";

/**
 * command line handling
 * 
 * @returns 
 */
function getCommand() {
    if (process.argv[2] === undefined) {
        return "./files/src.txt";
    }

    
    else if (process.argv[2] === "/c") {
        let content = process.argv.filter((_, i) => {
            if (i >= 3) {
                return true;
            }
            
            else {
                return false;
            }
        });
        
        let str = "";
        
        content.forEach((v) => {
            str += v + "\n";
        });

        str = str.replace(/'/gm, "\"");
        str = str.replace(/@/gm, "$"); // "$" is a meta char in cmd, so exchanged the "$" by "@" --- only in cmd -----------------

        fs.writeFileSync("./files/src.txt", str)
        
        return "./files/src.txt";
    }
    
    else if (process.argv[2] === "/d") {
        return "./files/src.txt";
    }
    
    else if (process.argv[2] === "/e") {
        const rd = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: false
        });

        let string = "";
        
        fs.writeFileSync("./files/src.txt", "");

        rd.on("line", (input) => {
            if (input === ".exit") {
                rd.close();
            }

            else if (input === ".run") {
                fs.writeFileSync("./files/src.txt", string);
                exec("qtm");
                rd.close();
            }

            string += input + "\n";
        });

        return "./files/src.txt";
    }

    else if (process.argv[2] !== undefined) {
        try {
            fs.readFileSync(process.argv[2], "utf-8");
    
            return process.argv[2];
        }
    
        catch {
            console.log(`the file: ${chalk.green(process.argv[2])} couldn't be open\n`);
        }
    
        return process.argv[2];
    }
}

export default getCommand;