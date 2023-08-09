module.exports = {
  apps: [
    {
      name: "keeper-bot-testnet",
      interpreter: "sh",
      script: "yarn",
      args: "bot:keeper --network arbitrumGoerli",
      restart_delay: 600000,
      autorestart: true,
    },
  ],
};
