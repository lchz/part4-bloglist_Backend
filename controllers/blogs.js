
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


module.exports = blogRouter