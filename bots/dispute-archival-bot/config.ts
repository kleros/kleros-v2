const variableKeysMap = {
  coreSubgraphUrl: "CORE_SUBGRAPH_URL",
  dtrSubgraphUrl: "DTR_SUBGRAPH_URL",
  graphApiKey: "GRAPH_API_KEY",
  ipfsUploadUrl: "IPFS_UPLOAD_URL",
  disputeArchiveAddress: "DISPUTE_ARCHIVE_ADDRESS",
  alchemyApiKey: "ALCHEMY_API_KEY",
  privateKey: "PRIVATE_KEY",
} as const;

type VariableKey = keyof typeof variableKeysMap;

type EnvConfig = Record<VariableKey, string>;

let cachedConfig: EnvConfig | undefined;

export const getEnvConfig = (): EnvConfig => {
  if (cachedConfig) return cachedConfig;

  const config: EnvConfig = {
    coreSubgraphUrl: "",
    dtrSubgraphUrl: "",
    graphApiKey: "",
    ipfsUploadUrl: "",
    disputeArchiveAddress: "",
    alchemyApiKey: "",
    privateKey: "",
  };

  for (const key of Object.keys(variableKeysMap) as VariableKey[]) {
    const envKey = variableKeysMap[key];
    const value = process.env[envKey];

    if (!value || value.trim() === "") throw new EnvVariableNotConfiguredError(envKey);

    config[key] = value;
  }

  cachedConfig = config;
  return config;
};

class EnvVariableNotConfiguredError extends Error {
  constructor(variableKey: string) {
    super(`${variableKey} not configured!`);

    Object.setPrototypeOf(this, EnvVariableNotConfiguredError.prototype);

    this.name = "EnvVariableNotConfiguredError";
  }
}
