module.exports = {
  apps: [
    {
      name: "foo",
      interpreter: "sh",
      script: "yarn",
      args: "foo",
      restart_delay: 3000,
      autorestart: true,
    },
    {
      name: "keeper-bot-testnet",
      interpreter: "sh",
      script: "yarn",
      args: "bot:keeper --network arbitrumGoerli",
      restart_delay: 600000,
      autorestart: true,
    },
    {
      name: "relayer-bot-from-chiado-testnet",
      interpreter: "sh",
      script: "yarn",
      args: "bot:relayer-from-chiado --network arbitrumGoerli",
      restart_delay: 5000,
      autorestart: true,
    },
  ],
};
