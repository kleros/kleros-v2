import dotenv from "dotenv";

dotenv.config();

const env = {
  require: (key: string): string => {
    const value = process.env[key];
    if (value === undefined) {
      throw new Error(`Environment variable ${key} is undefined`);
    }
    return value;
  },

  optional: (key: string, defaultValue: string): string => {
    const value = process.env[key];
    return value === undefined ? defaultValue : value;
  },

  optionalNoDefault: (key: string): string | undefined => {
    return process.env[key];
  },
};

export default env;
