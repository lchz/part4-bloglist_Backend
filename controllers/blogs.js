
const blogRouter = require('express').Router()
const Blog = require('../models/blog')

blogRouter.get('/', async (request, response) => {

    const blogs = await Blog.find({})
    response.json(blogs.map(b => b.toJSON()))

})

blogRouter.post('/', async (request, response) => {

    const blog = new Blog(request.body)

    if (!blog.title && !blog.url) {

        response.status(400).end()

    } else {

        if (blog.likes === undefined) {
        
            const newBlog = new Blog({...blog, likes: 0})
            const result = await newBlog.save()
            response.status(201).json(result)
    
        } else {
            const result = await blog.save()
            response.status(201).json(result)
        }
    }
})

blogRouter.delete('/:id', async (req, res, next) => {
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