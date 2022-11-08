const mongoose = require('mongoose')

const RedirectionStatisticsSchema = new mongoose.Schema({
  ip_address: {
    type: String,
    trim: true
  },
  user_agents: {
    type: String,
    trim: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
})

module.exports = {
  RedirectionStatisticsModel: mongoose.model('redirection_statistic', RedirectionStatisticsSchema),
  RedirectionStatisticsSchema: RedirectionStatisticsSchema
}