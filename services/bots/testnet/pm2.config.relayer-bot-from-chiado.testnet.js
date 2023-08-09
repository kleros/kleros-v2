module.exports = {
  apps: [
    {
      name: "relayer-bot-from-chiado-testnet",
      interpreter: "sh",
      script: "yarn",
      args: "bot:relayer-from-chiado --network arbitrumGoerli",
      restart_delay: 5000,
      autorestart: true,
    },
  ],
};
