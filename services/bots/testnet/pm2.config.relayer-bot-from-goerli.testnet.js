module.exports = {
  apps: [
    {
      name: "relayer-bot-from-sepolia-testnet",
      interpreter: "sh",
      script: "yarn",
      args: "bot:relayer-from-sepolia --network arbitrumSepolia",
      restart_delay: 5000, // 5 seconds
      autorestart: true,
    },
  ],
};
