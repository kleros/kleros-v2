declare global {
  // Error.captureStackTrace is V8 specific, but not standard. so defining the type here
  // https://github.com/microsoft/TypeScript/issues/3926#issuecomment-169096154
  interface ErrorConstructor {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    captureStackTrace(targetObject: object, constructorOpt?: Function);
  }
}

export {};
