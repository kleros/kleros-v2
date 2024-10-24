export class CustomError extends Error {
  constructor(name: string, message: string) {
    super(message);
    this.name = name;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class InvalidContextError extends CustomError {
  constructor(message: string) {
    super("InvalidContextError", message);
  }
}

export class InvalidMappingError extends CustomError {
  constructor(message: string) {
    super("InvalidMappingError", message);
  }
}

export class NotFoundError extends CustomError {
  public resourceName: string;

  constructor(resourceName: string, message: string) {
    super("NotFoundError", message);
    this.resourceName = resourceName;
  }
}
export class RequestError extends CustomError {
  public endpoint: string | undefined;

  constructor(message: string, endpoint?: string) {
    super("RequestError", message);
    this.endpoint = endpoint;
  }
}

export class UnsupportedActionError extends CustomError {
  constructor(message: string) {
    super("UnsupportedActionError", message);
  }
}

export class InvalidFormatError extends CustomError {
  constructor(message: string) {
    super("InvalidFormatError", message);
  }
}

export class SdkNotConfiguredError extends CustomError {
  constructor() {
    super("SdkNotConfiguredError", "SDK not configured. Please call `configureSDK` before using.");
  }
}
