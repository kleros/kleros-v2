export const isHexId = (str: string): boolean => /^0x[a-fA-F0-9]{1,64}$/.test(str);
