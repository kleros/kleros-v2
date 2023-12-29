module.exports = {
  apps: [
    {
      name: "disputor-bot-testnet",
      interpreter: "sh",
      script: "yarn",
      args: "bot:disputor --network arbitrumSepolia",
      restart_delay: 86400000, // 24 hours
      autorestart: true,
    },
  ],
};
