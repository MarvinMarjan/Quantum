/**
 * command line handling
 * 
 * @returns 
 */
function getCommand() {
    if (process.argv[2] === undefined && process.argv[2] !== "/d") {
        return "C:/Users/Usuario/Documents/program/Javascript/Back-End/Quantum/files/src.txt";
    }

    else if (process.argv[2] === "/d") {
        return "C:/Users/Usuario/Documents/program/Javascript/Back-End/Quantum/files/src.txt";
    }
}

export default getCommand;