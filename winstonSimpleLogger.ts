import winston, { Logger, LoggerOptions } from "winston";
import fs from "fs";

type Level = "error" | "warn" | "info" | "http" | "verbose" | "debug" | "silly";

type TReplaceOptions = Partial<{
  stack: boolean;
}>;

type TLevelType = {
  message?: string;
};

type TLoggerOptions = Omit<winston.LoggerOptions, "level" | "levels">;

type TLoggerOption = LoggerOptions & { level?: Level };

type TReplaceOption =  TLevelType;

type TLoggetMethods = {
  [T in Level]: (replaceOptions?: TReplaceOption) => TLoggetMethods;
};

type TLoggerCollection = (options?: TLoggerOptions) => TLoggetMethods;

const logger = (loggerOptions: Partial<TLoggerOption>): Logger => {
  return winston.createLogger({
    ...loggerOptions,
  });
};

type TCollectionsTree = {
  name: string;
  path: string;
  filename?: string;
} & Omit<winston.LoggerOptions, "level" | "levels" | "transports"> &
  TReplaceOptions;

const sendLog =
  (logmode: Level, item: TCollectionsTree, path: string) =>
  (replaceOptions?: TReplaceOption) => {
    let lg = logger({
      level: logmode,
      format: item?.format ? item.format : winston.format.json(),
      transports: [
        new winston.transports.File({
          dirname: item?.path ? item.path : path,
          filename: `${
            (item?.filename! as string)
              ? item.filename
              : item.name + "-" + logmode + ".log"
          }`,
        }),
      ],
    }) as winston.Logger;
    lg.log({
      level: logmode,
      message: `${replaceOptions?.message! as string} ${
        item?.stack ? new Error().stack : ""
      }`,
    });
  };

class WinstonSimpleLogger {
  [key: string]: TLoggerCollection;
  constructor(params?: {
    collections: TCollectionsTree[];
    config?: TLoggerOption;
  }) {
    params?.collections?.map((item: TCollectionsTree) => {
      const path = "logs";
      let pathExist = fs.existsSync(item?.path! ?? path);
      if (!pathExist) fs.mkdirSync(item?.path! ?? path);
      this[item.name] = (options?: TLoggerOptions): any => ({
        ["info"]: (replaceOptions?: TReplaceOption) => {
          sendLog("info", item, path)(replaceOptions);
          return this[item.name](item);
        },
        ["error"]: (replaceOptions?: TReplaceOption) => {
          sendLog("error", item, path)(replaceOptions);
          return this[item.name](item);
        },
        ["http"]: (replaceOptions?: TReplaceOption) => {
          sendLog("http", item, path)(replaceOptions);
          return this[item.name](item);
        },
        ["debug"]: (replaceOptions?: TReplaceOption) => {
          sendLog("debug", item, path)(replaceOptions);
          return this[item.name](item);
        },
        ["silly"]: (replaceOptions?: TReplaceOption) => {
          sendLog("silly", item, path)(replaceOptions);
          return this[item.name](item);
        },
        ["verbose"]: (replaceOptions?: TReplaceOption) => {
          sendLog("verbose", item, path)(replaceOptions);
          return this[item.name](item);
        },
        ["warn"]: (replaceOptions?: TReplaceOption) => {
          sendLog("warn", item, path)(replaceOptions);
          return this[item.name](item);
        },
      });
    });
  }
}

export default WistonSimpleLogger;
