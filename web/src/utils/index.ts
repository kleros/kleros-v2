export const notUndefined = (maybeObjects: any[] | any): boolean =>
  Array.isArray(maybeObjects)
    ? maybeObjects.reduce((acc, maybeObject) =>
        acc && _notUndefined(maybeObject) ? true : false
      )
    : _notUndefined(maybeObjects);

const _notUndefined = (maybeObject: any): boolean =>
  typeof maybeObject !== "undefined";
