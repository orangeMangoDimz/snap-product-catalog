class Logger {
    static info(msg) {
        const template = `[${new Date().toISOString()}] [INFO] ${msg}`;
        console.log(template);
    }
    static warn(msg) {
        const template = `[${new Date().toISOString()}] [WARN] ${msg}`;
        console.warn(template);
    }
    static error(msg, error = null) {
        const template = `[${new Date().toISOString()}] [ERROR] ${msg}`;
        console.error(template);
        if (error && error.stack) {
            console.error(error.stack);
        }
    }
}

module.exports = Logger