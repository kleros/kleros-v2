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

export class NotFoundError extends Error {
  public resourceName: string;

  constructor(resourceName: string, message: string) {
    super(message);
    this.name = "NotFoundError";
    this.resourceName = resourceName;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class RequestError extends Error {
  public endpoint: string | undefined;

  constructor(message: string, endpoint?: string) {
    super(message);
    this.name = "RequestError";
    this.endpoint = endpoint;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class UnsupportedActionError extends CustomError {
  constructor(message: string) {
    super("UnsupportedActionError", message);
  }
}

export class InvalidFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidFormatError";

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class SdkNotConfiguredError extends Error {
  constructor() {
    super("SDK not configured. Please call `configureSDK` before using.");
    this.name = "SdkNotConfiguredError";

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
