module.exports = {
  apps: [
    {
      name: "relayer-bot-from-chiado-devnet",
      interpreter: "sh",
      script: "yarn",
      args: "bot:relayer-from-chiado --network arbitrumGoerliDevnet",
      restart_delay: 5000,
      autorestart: true,
    },
  ],
};
