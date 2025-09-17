class Logger {
    static info(msg) {
        const template = `[${new Date().toISOString()}] [INFO] ${msg}`;
        console.log(template);
    }
    static warn(msg) {
        const template = `[${new Date().toISOString()}] [WARN] ${msg}`;
        console.warn(template);
    }
    static error(msg) {
        const template = `[${new Date().toISOString()}] [ERROR] ${msg}`;
        console.error(template);
    }
}

module.exports = Logger