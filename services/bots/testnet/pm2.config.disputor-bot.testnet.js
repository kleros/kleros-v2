module.exports = {
  apps: [
    {
      name: "disputor-bot-testnet",
      interpreter: "sh",
      script: "yarn",
      args: "bot:disputor --network arbitrumGoerli",
      restart_delay: 43200000, // 12 hours
      autorestart: true,
    },
  ],
};
