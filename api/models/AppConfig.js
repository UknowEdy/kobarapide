const mongoose = require('mongoose');

const AppConfigSchema = new mongoose.Schema({
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastModifiedAt: {
    type: Date,
    default: Date.now
  },
  maintenanceMessage: {
    type: String,
    default: 'Le site est actuellement en maintenance. Nous serons de retour bientôt.'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AppConfig', AppConfigSchema);
