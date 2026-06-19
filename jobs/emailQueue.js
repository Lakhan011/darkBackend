const { Queue, Worker } = require('bullmq');
const logger = require('../utils/logger');
const emailHelper = require('../helpers/email.helper');

const redisOptions = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
};

const emailQueue = new Queue('email', { connection: redisOptions });

const worker = new Worker('email', async job => {
  const { type, data } = job.data;
  
  try {
    switch(type) {
      case 'welcome':
        await emailHelper.sendWelcomeEmail(data.to, data.name);
        break;
      case 'otp':
        await emailHelper.sendOTPEmail(data.to, data.otp);
        break;
      case 'password-reset':
        await emailHelper.sendPasswordResetEmail(data.to, data.resetUrl);
        break;
      case 'order-confirm':
        await emailHelper.sendOrderConfirmationEmail(data.to, data.orderData);
        break;
      case 'order-status':
        await emailHelper.sendOrderStatusEmail(data.to, data.orderData, data.status);
        break;
      default:
        logger.warn(`Unknown email job type: ${type}`);
    }
  } catch (error) {
    logger.error(`Error processing email job ${job.id}: ${error.message}`);
    throw error;
  }
}, { connection: redisOptions });

worker.on('completed', job => {
  logger.info(`Email job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  logger.error(`Email job ${job.id} failed: ${err.message}`);
});

exports.emailQueue = emailQueue;

exports.addEmailJob = async (type, data) => {
  try {
    await emailQueue.add(type, { type, data }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000
      }
    });
  } catch (error) {
    logger.error(`Failed to add email job: ${error.message}`);
  }
};
