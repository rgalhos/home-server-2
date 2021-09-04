import winston from "winston";

const minLevel = process.env.NODE_ENV === "development" ? "debug" : "info";

const levels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        verbose: 4,
        debug: 5,
        silly: 6,
    },
    colors: {
        error: "red",
        warn: "yellow",
        info: "green",
        http: "black whiteBG",
        verbose: "blue",
        debug: "magenta",
        silly: "black magentaBG",
    },
};

winston.addColors(levels.colors);

const format = winston.format.combine(
    winston.format.timestamp(),
    winston.format.simple(),
    winston.format.json(),
    winston.format.prettyPrint(),
    winston.format.printf(({ level, message, timestamp }) => {
        return `${timestamp} [${level}] ${message}`;
    })
);

const logger = winston.createLogger({
    levels: levels.levels,
    format: format,
    transports: [
        new winston.transports.Console({
            level: minLevel,
            format: winston.format.combine(winston.format.colorize(), format),
        }),

        new winston.transports.File({
            filename: "logging.log",
            level: minLevel,
        })
    ],
});

const httpLogger = winston.createLogger({
    levels: { http: 0 },
    format: format,
    transports: [
        new winston.transports.File({
            filename: "http.log",
            level: "http",
            maxsize: 1e7, // 10 MB
        })
    ]
});

// temporary workaround
const wrapper = (fn: winston.LeveledLogMethod) => (...args: any[]) => fn(args.join(" "));

logger.error = wrapper(logger.error);
logger.warn = wrapper(logger.warn);
logger.info = wrapper(logger.info);
logger.http = wrapper(httpLogger.http);
logger.verbose = wrapper(logger.verbose);
logger.debug = wrapper(logger.debug);
logger.silly = wrapper(logger.silly);

export default logger;
