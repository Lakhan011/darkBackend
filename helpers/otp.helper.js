const cache = require('../config/cache');

exports.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.storeOTP = (key, otp, ttlMinutes = 5) => {
  cache.set(`otp_${key}`, otp, ttlMinutes * 60);
};

exports.verifyOTP = (key, otp) => {
  const storedOTP = cache.get(`otp_${key}`);
  if (storedOTP && storedOTP === otp) {
    cache.del(`otp_${key}`);
    return true;
  }
  return false;
};
