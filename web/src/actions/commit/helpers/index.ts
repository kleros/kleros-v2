const SEPARATOR = "-";
export const encodeShutterMessage = (choice: bigint, salt: bigint, justification: string) => {
  return `${choice.toString()}${SEPARATOR}${salt.toString()}${SEPARATOR}${justification}`;
};
