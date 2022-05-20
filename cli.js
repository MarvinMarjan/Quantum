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
        console.log(`${chalk.blueBright("Commands:")}\n\n${chalk.yellow("/c")} --> execute one or more language commands\n   --> example: qtm /c "print('hello, world')"\n   --> lines are separated by arguments\n   --> qtm /c "var num = 10" "print(@num)" // use "@" instead "$" while using /c`);

        console.log(`\n${chalk.yellow("/e")} --> open a editor to run the interpreter --> ".run" to run, ".exit" to exit`)
        console.log(`   ${chalk.blueBright("-s")} to save the editor data --> qtm /e -s (path)`)

        fs.writeFileSync("__qtm_cache.txt", "");
        return "./__qtm_cache.txt";
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

        fs.writeFileSync("./__qtm_cache.txt", str)
        
        return "./__qtm_cache.txt";
    }
    
    else if (process.argv[2] === "/e") {
        const rd = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: false
        });

        let string = "";
        
        fs.writeFileSync("./__qtm_cache.txt", "");

        rd.on("line", (input) => {
            if (input === ".exit") {
                rd.close();
            }

            else if (input === ".run") {
                fs.writeFileSync("./__qtm_cache.txt", string);
                exec("qtm ./__qtm_cache.txt");

                if (process.argv[3] === "-s") {
                    fs.writeFileSync(process.argv[4], string);
                }

                rd.close();
            }

            string += input + "\n";
        });

        return "./__qtm_cache.txt";
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