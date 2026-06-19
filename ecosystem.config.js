module.exports = {
  apps: [{
    name: 'darkbackend',
    script: './bin/www',
    instances: 'max',
    exec_mode: 'cluster',
    env: { 
      NODE_ENV: 'development', 
      PORT: 3000 
    },
    env_production: { 
      NODE_ENV: 'production', 
      PORT: 3000 
    },
    log_file: './logs/combined.log',
    error_file: './logs/error.log',
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss'
  }]
};
