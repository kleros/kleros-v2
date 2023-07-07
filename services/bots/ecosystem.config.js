module.exports = {
  apps: [
    {
      name: "foo",
      interpreter: "bash",
      script: "yarn",
      args: "foo",
      restart_delay: 3000,
      autorestart: true,
    },
    {
      name: "keeper-bot-testnet",
      interpreter: "bash",
      script: "yarn",
      args: "bot:keeper --network arbitrumGoerli",
      restart_delay: 600000,
      autorestart: true,
    },
    {
      name: "relayer-bot-from-chiado-testnet",
      interpreter: "bash",
      script: "yarn",
      args: "bot:relayer-from-chiado --network arbitrumGoerli",
      restart_delay: 2000,
      autorestart: true,
    },
  ],
};
