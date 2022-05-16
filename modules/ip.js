import os from "os"

class Ip {
    constructor(type) {
        if (type === "ipv4") {
            this.return = this.ipv4();
        }
    }

    ipv4() {
        let ip = os.networkInterfaces();

        return ip["Wi-Fi 2"][ip["Wi-Fi 2"].length - 1].address;
    }
}

export default Ip;