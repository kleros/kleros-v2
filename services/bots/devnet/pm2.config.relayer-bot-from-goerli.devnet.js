module.exports = {
  apps: [
    {
      name: "relayer-bot-from-sepolia-devnet",
      interpreter: "sh",
      script: "yarn",
      args: "bot:relayer-from-sepolia --network arbitrumSepoliaDevnet",
      restart_delay: 5000, // 5 seconds
      autorestart: true,
    },
  ],
};
