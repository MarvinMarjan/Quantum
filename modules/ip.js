import os from "os"

/**
 * class for ip handling
 */
class Ip {
    /**
     * @param {*} type ip type
     */
    constructor(type) {
        if (type === "ipv4") {
            this.return = this.ipv4();
        }
    }

    /**
     * @returns the ipv4 
     */
    ipv4() {
        let ip = os.networkInterfaces();

        return ip["Wi-Fi 2"][ip["Wi-Fi 2"].length - 1].address;
    }
}

export default Ip;