import fs from "fs"

class File {
    constructor(type, path, data="") {
        this.encoding = "utf-8";

        if (type === "read") {
            this.return = this.read(path);
        }

        else if (type === "write") {
            this.return = this.write(path, data);
        }
    }

    read(path) {
        return fs.readFileSync(path, this.encoding);
    }

    write(path, data) {
        try {
            fs.writeFileSync(path, data);
            
            return true;
        }

        catch {
            return false
        }
    }
}

export default File;