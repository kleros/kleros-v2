module.exports = {
  apps: [
    {
      name: "disputor-bot-devnet",
      interpreter: "sh",
      script: "yarn",
      args: "bot:disputor --network arbitrumSepoliaDevnet",
      restart_delay: 86400000, // 24 hours
      autorestart: true,
    },
  ],
};
