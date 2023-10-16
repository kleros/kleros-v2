export const findNestedKey = (data, keyToFind) => {
  if (data.hasOwnProperty(keyToFind)) return data[keyToFind];
  for (let key in data) {
    if (typeof data[key] === "object" && data[key] !== null) {
      const found = findNestedKey(data[key], keyToFind);
      if (found) return found;
    }
  }
  return null;
};
