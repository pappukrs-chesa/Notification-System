module.exports = {
  apps: [
    {
      name: 'notify-api',
      script: './dist/server.js',
      node_args: '--env-file=.env',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '300M',
      env: { NODE_ENV: 'production' },
    },
    {
      name: 'notify-worker',
      script: './dist/worker.js',
      node_args: '--env-file=.env',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '300M',
      env: { NODE_ENV: 'production' },
    },
  ],
};
