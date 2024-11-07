module.exports = {
  apps: [
    {
      name: "keeper-bot-mainnet-neo",
      interpreter: "sh",
      script: "yarn",
      args: "bot:keeper --network arbitrum",
      restart_delay: 600000, // 10 minutes
      autorestart: true,
    },
  ],
};
