const mongoose = require('mongoose');

const deliveryBoySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  vehicleType: { type: String, enum: ['BIKE', 'SCOOTER', 'CAR', 'BICYCLE'] },
  vehicleNumber: String,
  currentLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true, default: [0, 0] }
  },
  isAvailable: { type: Boolean, default: false },
  isOnline: { type: Boolean, default: false },
  assignedOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  totalDeliveries: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

deliveryBoySchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('DeliveryBoy', deliveryBoySchema);
