module.exports = {
  apps: [
    {
      name: "keeper-bot-devnet",
      interpreter: "sh",
      script: "yarn",
      args: "bot:keeper --network arbitrumGoerliDevnet",
      restart_delay: 600000,
      autorestart: true,
    },
  ],
};
