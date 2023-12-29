module.exports = {
  apps: [
    {
      name: "relayer-bot-from-chiado-devnet",
      interpreter: "sh",
      script: "yarn",
      args: "bot:relayer-from-chiado --network arbitrumSepoliaDevnet",
      restart_delay: 5000, // 5 seconds
      autorestart: true,
    },
  ],
};
