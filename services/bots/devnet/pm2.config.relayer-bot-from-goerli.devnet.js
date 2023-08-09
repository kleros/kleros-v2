module.exports = {
  apps: [
    {
      name: "relayer-bot-from-goerli-devnet",
      interpreter: "sh",
      script: "yarn",
      args: "bot:relayer-from-goerli --network arbitrumGoerliDevnet",
      restart_delay: 5000,
      autorestart: true,
    },
  ],
};
