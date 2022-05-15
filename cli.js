function getCommand() {
    if (process.argv.length < 3) {
        return "C:/Users/Usuario/Documents/program/Javascript/Back-End/Quantum/files/src.txt";
    }

    else {
        return process.argv[2];
    }
}

export default getCommand;