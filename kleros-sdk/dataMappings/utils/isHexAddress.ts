export const isHexAddress = (str: string): boolean => /^0x[a-fA-F0-9]{40}$/.test(str);
