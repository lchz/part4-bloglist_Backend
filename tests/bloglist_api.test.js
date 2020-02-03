const mongoose = require('mongoose')
const supertest = require('supertest')

const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')

const helper = require('./test_helper')


beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
})

/** Test GET all */
test('blogs are returned as json', async () => {
    await api.get('/api/blogs')
             .expect(200)
             .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body.length).toBe(helper.initialBlogs.length)
})

test('a specific blog is within the returned blogs', async () => {
    const res = await api.get('/api/blogs')
    const titles = res.body.map(r => r.title)

    expect(titles).toContain('An interesting day')
})

test('a blog is containing id filed', async () => {
    const res = await api.get('/api/blogs')
    for (let blog of res.body) {
        expect(blog.id).toBeDefined()
    }
})

/** Test POST */
test('a valid blog can be added', async () => {
    const newBlog = {
        title: 'Testing POST method',
        author: 'queue',
        url: 'http://testtest/post',
        likes: 0
    }

    await api.post('/api/blogs')
             .send(newBlog)
             .expect(201)
             .expect('Content-Type', /application\/json/)

    const allBlogs = await Blog.find({})
    const titles = allBlogs.map(b => b.title)

    expect(allBlogs.length).toBe(helper.initialBlogs.length + 1)       
    expect(titles).toContain('Testing POST method')
})

test('likes default value is 0 when it is missing', async () => {
    const newBlog = {
        title: 'Jest is wonderful',
        author: 'queue',
        url: 'http://testtest/post'
    }

    await api.post('/api/blogs')
             .send(newBlog)
             .expect(201)
             .expect('Content-Type', /application\/json/)

    const allBlogs = await Blog.find({})
    const addedBlog = allBlogs[allBlogs.length-1]

    expect(addedBlog.likes).toBe(0)
})

test('could not create a blog without title and url', async () => {
    const newBlog = {
        author: 'queue',
        likes: 0
    }

    await api.post('/api/blogs')
             .send(newBlog)
             .expect(400)

})


afterAll(() => {
    mongoose.connection.close()
})