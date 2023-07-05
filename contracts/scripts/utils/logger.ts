import pino from "pino";
import { TransportTargetOptions } from "pino";
import dotenv from "dotenv";

dotenv.config();

namespace logger {
  export type LoggerOptions = {
    level?: string;
    transportTargetOptions?: TransportTargetOptions;
  };

  export const createLogger = (options?: LoggerOptions): pino.Logger => {
    const targets: TransportTargetOptions[] = [
      {
        target: "pino-pretty",
        options: {},
        level: options?.level ?? "info",
      },
    ];

    if (options?.transportTargetOptions) {
      targets.push(options.transportTargetOptions);
    }

    return pino(
      {
        level: options?.level ?? "info",
        timestamp: pino.stdTimeFunctions.isoTime,
      },
      pino.transport({ targets: targets })
    );
  };
}

export default logger;
