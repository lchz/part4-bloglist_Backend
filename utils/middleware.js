
const logger = require('./logger')

const errorHandler = (error, req, res, next) => {
    logger.error(error.message)

    next(error)
}


module.exports = {
    errorHandler
}