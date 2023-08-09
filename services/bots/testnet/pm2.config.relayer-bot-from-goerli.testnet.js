module.exports = {
  apps: [
    {
      name: "relayer-bot-from-goerli-testnet",
      interpreter: "sh",
      script: "yarn",
      args: "bot:relayer-from-goerli --network arbitrumGoerli",
      restart_delay: 5000,
      autorestart: true,
    },
  ],
};
