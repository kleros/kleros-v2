module.exports = {
  apps: [
    {
      name: "keeper-bot-testnet",
      interpreter: "sh",
      script: "yarn",
      args: "bot:keeper --network arbitrumSepolia",
      restart_delay: 600000, // 10 minutes
      autorestart: true,
    },
  ],
};
