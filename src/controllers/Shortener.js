const ShortenerModel = require('../models/Shortener')
const { 
  RedirectionStatisticsModel, 
  RedirectionStatisticsSchema 
} = require('../models/RedirectionStatistics')
const md5 = require('md5')

/**
 * @desc    Open shorten url 
 * @route   GET /
 * @access  Public
 */
exports.openShortenUrl = async(req, res, next) => {
  const customAlias = req.params.custom_alias ?? ''
  if (customAlias === '')
    return res.status(400).json({
      error: {
        code: 400,
        message: 'Empty custom_alias data'
      }
    })

  const customAliasData = await ShortenerModel.findOne({custom_alias: customAlias})
  if (!customAliasData)
    return res.status(404).json({
      error: {
        code: 404,
        message: 'custom_alias not found'
      }
    })

  // Parse redirect_url
  const redirectUrl = customAliasData.source_url

  // Validate valid url
  const isUrlValid = isValidUrl(redirectUrl)
  if (!isUrlValid)
  return res.status(404).json({
    error: {
      code: 400,
      message: 'custom_alias is invalid'
    }
  })

  // Update clicks stats
  let clicksValue = customAliasData.clicks ?? 0
  const filter = {custom_alias: customAlias}
  const update = {
    clicks: clicksValue + 1,
    $push: {
      redirect_statistics: {
        ip_address: req.socket.remoteAddress ?? '',
        user_agents: req.headers['user-agent']
      }
    }
  }
  const updateUrlRedirectStatistic = await ShortenerModel.findOneAndUpdate(
    filter,
    update
  )

  return res.redirect(redirectUrl)
}

/**
 * @desc    Create defined custom-alias 
 * @route   POST /custom-alias
 * @access  Public
 * 
 * TODO: 
 * - validate using token
 * - validate allowed character in url
 */
exports.createShortenUrl = async(req, res, next) => {
  // Input validation
  const customAliasValue = req.body.custom_alias ?? ''
  const sourceUrlValue = req.body.source_url ?? ''
  if (customAliasValue === '' || sourceUrlValue === '')
    return res.status(400).json({
      error: {
        code: 400,
        message: 'Field is required, source_url or custom_alias'
      }
    })

  // Validate valid url
  const isUrlValid = isValidUrl(sourceUrlValue)
  console.log(isUrlValid)
  if (!isUrlValid)
  return res.status(400).json({
    error: {
      code: 400,
      message: 'source_url is invalid'
    }
  })

  // Validate custom alias value
  const isCustomAliasAlreadyExist = await isCustomAliasExist(customAliasValue)
  if (isCustomAliasAlreadyExist)
    return res.status(400).json({
      error: {
        code: 400,
        message: 'Same value for custom_alias url'
      }
    })

  // Create custom_alias value
  const createResult = await ShortenerModel.create(req.body)

  return res.status(201).json({
    success: true,
    message: 'success to save data',
    data: createResult
  })
}

/**
 * @desc    Create random custom-alias 
 * @route   POST /custom-alias/random
 * @access  Public
 */
exports.createRandomCustomAliasUrl = async(req, res, next) => {
  const sourceUrlValue = req.body.source_url ?? ''
  if (sourceUrlValue === '')
    return res.status(400).json({
      error: {
        code: 400,
        message: 'Empty source_url'
      }
    })

    // Validate valid url
    const isUrlValid = isValidUrl(sourceUrlValue)
    if (!isUrlValid)
    return res.status(400).json({
      error: {
        code: 400,
        message: 'source_url is invalid'
      }
    })

  // Generate custom_alias url
  const generatedCustomAlias = generateCustomAliasUrl(sourceUrlValue)

  // Validate whether same value custom_alias is exist
  const isCustomAliasAlreadyExist = await isCustomAliasExist(generatedCustomAlias)
  if (isCustomAliasAlreadyExist)
    return res.status(400).json({
      error: {
        code: 400,
        message: 'Same value for custom_alias url'
      }
    })
  
  const createResult = await ShortenerModel.create({
    source_url: sourceUrlValue,
    custom_alias: generatedCustomAlias
  })

  return res.status(201).json({
    success: true,
    message: 'success to save data',
    data: createResult
  })
}

exports.deleteCustomAliasUrl = async(req, res, next) => {
  const customAliasValue = req.params.custom_alias ?? ''
  if (customAliasValue === '')
    return res.status(400).json({
      error: {
        code: 400,
        message: 'Field is required, custom_alias'
      }
    })

  // Delete custom_alias value
  const deleteResult = await ShortenerModel.findOneAndDelete({custom_alias: customAliasValue})
  if (!deleteResult)
    return res.status(400).json({
      success: false,
      message: "unable to delete data"
    })

  return res.status(200).json({
    success: true,
    message: 'success to delete data',
    data: deleteResult
  })
}

const isCustomAliasExist = async(customAliasUrl) => {
  const customAliasData = await ShortenerModel.findOne({custom_alias: customAliasUrl})
  const isValueExist = (customAliasData) ? true : false
  return isValueExist
}

const generateCustomAliasUrl = (originalUrl) => {
  // Generate hashed url
  const currentUnixDate = Date.now()
  const hashedUnixDate = md5(currentUnixDate)
  const reformattedUrl = `${hashedUnixDate}${originalUrl}` 
  const hashedOriginalUrl = Buffer.from(reformattedUrl).toString('base64')

  // Substring 6 character from hashed url to be custom alias url
  const customAliasUrl = hashedOriginalUrl.substring(0, 6)
  return customAliasUrl
}

const isValidUrl = (customAliasUrl) => {
  try {
    const url = new URL(customAliasUrl)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch (error) {
    return false
  }
}