
const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

const jwt = require('jsonwebtoken')



blogRouter.get('/', async (request, response) => {

    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1})
    response.json(blogs.map(b => b.toJSON()))

})

blogRouter.post('/', async (req, res) => {
    const body = req.body
    const decodedToken = jwt.verify(req.token, process.env.SECRET)
    
    if (!req.token || !decodedToken.id) {
        return res.status(401).json({ error: 'token missing or invalid'})
    }

    const user = await User.findById(decodedToken.id)

    if (!(body.title && body.url)) {
        return res.status(400).end()
    } 

    let savedBlog = null

    if (body.likes === undefined) {
    
        const newBlog = new Blog({
            title: body.title,
            author: body.author,
            url: body.url,
            likes: 0,
            user: user.id
        })
        savedBlog = await newBlog.save()

    } else {

        const newBlog = new Blog({
            title: body.title,
            author: body.author,
            url: body.url,
            likes: body.likes,
            user: user.id
        })

        savedBlog = await newBlog.save()
    }
    
    user.blogs = user.blogs.concat(savedBlog.id)
    await user.save()

    res.json(savedBlog.toJSON())
})

blogRouter.delete('/:id', async (req, res, next) => {

    const decodedToken = jwt.verify(req.token, process.env.SECRET)
    
    if (!req.token || !decodedToken.id) {
        return res.status(401).json({ error: 'token missing or invalid'})
    }

    const user = await User.findById(decodedToken.id)
    const deletingBlog = await Blog.findById(req.params.id)

    if (deletingBlog.user.toString() !== user.id.toString()) {
        return res.status(401).json({ error: 'Not authorized' })
    }

    await Blog.findByIdAndDelete(req.params.id)
    
    res.status(200).end()
})

blogRouter.put('/:id', async (req, res, next) => {
    const body = req.body

    const blog = {
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes
    }

    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, blog, { new: true })
    res.json(updatedBlog.toJSON())

})


module.exports = blogRouter