
const bcrypt = require('bcrypt')
const userRouter = require('express').Router()
const User = require('../models/user')


userRouter.get('/', async (req, res) => {
    const users = await User.find({})
    res.json(users.map(u => u.toJSON()))
})

userRouter.post('/', async (req, res) => {
    const body = req.body
    
    if (body.password === undefined || body.password.length < 3) {
        return res.status(400).json({ error: 'Password must have at least 3 characters.' })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const user = new User({
        username: body.username,
        name: body.name,
        passwordHash,
    })

    const savedUser = await user.save()
    res.json(savedUser)
})


module.exports = userRouter