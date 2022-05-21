import { error } from "console";
import fs from "fs"

/**
 * a class for handling files
 */
class File {
    /**
     * 
     * @param {*} type handling type
     * @param {*} path path to file
     * @param {*} data data (mandatory only in write mode)
     */
    constructor(type, path, data="") {
        this.encoding = "utf-8";

        if (type === "read") {
            this.return = this.read(path);
        }

        else if (type === "write") {
            this.return = this.write(path, data);
        }

        else if (type === "rename") {
            let oldPath = path[0];
            let newPath = path[1];

            this.return = this.rename(oldPath, newPath);
        }
    }

    /**
     * reads a file and returns its content
     * 
     * @param {*} path path to file
     * @returns file content
     */
    read(path) {
        return fs.readFileSync(path, this.encoding);
    }

    /**
     * write or create a file
     * 
     * @param {*} path path to file
     * @param {*} data initial data
     * @returns true if no error ocurried
     */
    write(path, data) {
        try {
            fs.writeFileSync(path, data);
            
            return true;
        }

        catch {
            return false
        }
    }

    rename(oldPath, newPath) {
        try {
            fs.rename(oldPath, newPath, () => {});

            return true
        }

        catch {
            throw new Error(`couldn't rename the file: "${oldPath}"`);
        }
    }
}

export default File;