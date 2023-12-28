module.exports = {
  apps: [
    {
      name: "keeper-bot-devnet",
      interpreter: "sh",
      script: "yarn",
      args: "bot:keeper --network arbitrumSepoliaDevnet",
      restart_delay: 600000, // 10 minutes
      autorestart: true,
    },
  ],
};
