require('dotenv').config()

let PORT = process.env.PORT
let mongoUrl = process.env.mongoUrl

if (process.env.NODE_ENV === 'test') {
    mongoUrl = process.env.TEST_MONGODB_URI
}

module.exports = {
    PORT,
    mongoUrl
}