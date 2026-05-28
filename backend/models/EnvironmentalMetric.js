import mongoose from 'mongoose';

const EnvironmentalMetricSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  method: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  status: {
    type: Number,
    required: true
  },
  responseTime: {
    type: Number,
    required: true
  },
  bytesTransferred: {
    type: Number,
    required: true
  },
  co2Emissions: {
    type: Number,
    required: true
  }
});

const EnvironmentalMetric = mongoose.model('EnvironmentalMetric', EnvironmentalMetricSchema);

export default EnvironmentalMetric;
