const mongoose = require('mongoose')
const { RedirectionStatisticsSchema } = require('./RedirectionStatistics')

const UrlShortenerSchema = new mongoose.Schema({
  source_url: {
    type: String,
    trim: true,
    required: [true, 'Source URL is required']
  },
  custom_alias: {
    type: String,
    trim: true,
    required: [true, 'Custom Alias URL is required']
  },
  expired_at: {
    type: Date
  },
  clicks: {
    type: Number
  },
  redirect_statistics: {
    type: Array,
    default: []
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

module.exports = mongoose.model('url_shorteners', UrlShortenerSchema)