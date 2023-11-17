module.exports = {
  apps: [
    {
      name: "disputor-bot-testnet",
      interpreter: "sh",
      script: "yarn",
      args: "bot:disputor --network arbitrumSepolia",
      restart_delay: 43200000, // 12 hours
      autorestart: true,
    },
  ],
};
