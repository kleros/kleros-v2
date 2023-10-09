import pino, { TransportTargetOptions } from "pino";

// Intended for Netlify functions
export const createLogger = (logtailToken?: string): pino.Logger => {
  const targets: TransportTargetOptions[] = [
    {
      target: "pino-pretty",
      options: {},
      level: "info",
    },
  ];
  if (logtailToken) {
    targets.push({
      target: "@logtail/pino",
      options: { sourceToken: logtailToken },
      level: "info",
    });
  }
  return pino(
    {
      level: "info",
      timestamp: pino.stdTimeFunctions.isoTime,
    },
    pino.transport({ targets: targets })
  );
};

export const throwNewError = (logger: pino.Logger, message: string, error?: any) => {
  if (!error) {
    logger.error(message);
    throw new Error(message);
  }
  if (typeof error === "string") {
    logger.error(error, message);
    throw new Error(message + ": " + error);
  } else if (error instanceof Error) {
    logger.error(error, message);
    throw new Error(message + ": " + error.name + ": " + error.message);
  }
};
