const mongoose = require('mongoose')
const supertest = require('supertest')

const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')
const User = require('../models/user')

const helper = require('./test_helper')

/** For authentication */
let auth = {}


/** Blog tests */
describe('when there are initially some blogs saved', () => {
    beforeEach(async () => {
        await User.deleteMany({})

        await api.post('/api/users')
                .send({
                    username: 'test_user',
                    name: "Test User",
                    password: 'testUser'
                })

        const initialUser = {
            username: "test_user",
            password: "testUser"
        }

        const res = await api.post('/api/login')
                             .send(initialUser)

        auth.token = res.body.token
        // auth.user_id = jsonwebtoken.verify(auth.token, process.env.SECRET).id
        
        await Blog.deleteMany({})
        await Blog.insertMany(helper.initialBlogs)
    })

    /** Blog GET all */
    describe('valid blogs can be returned', () => {

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

        test('a blog contains id filed', async () => {
            const res = await api.get('/api/blogs')
            for (let blog of res.body) {
                expect(blog.id).toBeDefined()
            }
        })
    })

    /** Blog Authenticated POST */
    describe('valid blogs can be created with valid authorization', () => {

        test('a valid blog can be added', async () => {
            const blogsAtStart = await Blog.find({})

            const newBlog = {
                title: 'Testing POST method',
                author: 'queue',
                url: 'http://testtest/post',
                likes: 55
            }

            await api.post('/api/blogs')
                     .set('Authorization', 'bearer '.concat(auth.token))
                     .send(newBlog)
                     .expect(200)
                     .expect('Content-Type', /application\/json/)

            const allBlogs = await Blog.find({})
            const titles = allBlogs.map(b => b.title)

            expect(allBlogs.length).toBe(blogsAtStart.length + 1)
            expect(titles).toContain('Testing POST method')
        })

        test('likes default value is 0 when it is missing', async () => {
            const newBlog = {
                title: 'Jest is wonderful',
                author: 'queue',
                url: 'http://testtest/post'
            }

            await api.post('/api/blogs')
                     .set('Authorization', 'bearer '.concat(auth.token))
                     .send(newBlog)
                     .expect(200)
                     .expect('Content-Type', /application\/json/)

            const allBlogs = await Blog.find({})
            const addedBlog = allBlogs[allBlogs.length - 1]

            expect(addedBlog.likes).toBe(0)
        })

        test('could not create a blog without title and url', async () => {
            const newBlog = {
                author: 'queue',
                likes: 0
            }

            await api.post('/api/blogs')
                     .set('Authorization', 'bearer '.concat(auth.token))
                     .send(newBlog)
                     .expect(400)
        })
    })

    describe('new blog cannot be created when', () => {
        
        test('user is not logged in', async () => {
            const blogsAtStart = await Blog.find({})

            const newBlog = {
                title: 'Authentication is important',
                author: 'Smith Acherland',
                url: 'http://smith/authentication',
                likes: 12
            }

            await api.post('/api/blogs')
                     .send(newBlog)
                     .expect(401)
                     .expect('Content-Type', /application\/json/)

            const blogsAtEnd = await Blog.find({})
            expect(blogsAtEnd.length).toBe(blogsAtStart.length)

            const titles = blogsAtEnd.map(b => b.title)
            expect(titles).not.toContain('Authentication is important')
        })
    })

})

/** User tests */
describe('when there is initially one user at database', () => {
    beforeEach(async () => {
        await User.deleteMany({})

        await api.post('/api/users')
                .send({
                    username: 'root_jest',
                    name: "Test User",
                    password: 'rootjest'
                })

    })

    /** User POST */
    test('user creation succeeds with valid user info', async () => {
        const usersAtStart = await User.find({})

        const newUser = {
            username: 'test',
            name: 'Test Role',
            password: 'test'
        }

        const result = await api.post('/api/users')
            .send(newUser)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await User.find({})
        expect(usersAtEnd.length).toBe(usersAtStart.length + 1)

        const usernames = usersAtEnd.map(u => u.username)
        expect(usernames).toContain(newUser.username)
    })

    describe('creation fails with proper status code and message if', () => {

        test('username is already taken', async () => {
            const usersAtStart = await User.find({})

            const newUser = {
                username: 'root_jest',
                name: 'duplicated',
                password: 'root'
            }

            const result = await api.post('/api/users')
                                    .send(newUser)
                                    .expect(400)
                                    .expect('Content-Type', /application\/json/)

            expect(result.body.error).toContain('`username` to be unique')

            const usersAtEnd = await User.find({})
            expect(usersAtEnd.length).toBe(usersAtStart.length)
        })

        test('username is shorter than 3 characters', async () => {
            const usersAtStart = await User.find({})

            const newUser = {
                username: 'rt',
                name: 'duplicated',
                password: 'root'
            }

            const result = await api.post('/api/users')
                .send(newUser)
                .expect(400)
                .expect('Content-Type', /application\/json/)

            expect(result.body.error).toContain('`username` (`rt`) is shorter than the minimum allowed length (3).')

            const usersAtEnd = await User.find({})
            expect(usersAtEnd.length).toBe(usersAtStart.length)
        })

        test('username is missing', async () => {
            const usersAtStart = await User.find({})

            const newUser = {
                name: 'Not Valid',
                password: 'ottttt'
            }

            const result = await api.post('/api/users')
                .send(newUser)
                .expect(400)
                .expect('Content-Type', /application\/json/)

            expect(result.body.error).toContain('`username` is required.')

            const usersAtEnd = await User.find({})
            expect(usersAtEnd.length).toBe(usersAtStart.length)
        })

        test('password is shorter than 3 characters', async () => {
            const usersAtStart = await User.find({})

            const newUser = {
                username: 'rooopt',
                name: 'Not Valid',
                password: 'ot'
            }

            const result = await api.post('/api/users')
                .send(newUser)
                .expect(400)
                .expect('Content-Type', /application\/json/)

            expect(result.body.error).toContain('Password must have at least 3 characters.')

            const usersAtEnd = await User.find({})
            expect(usersAtEnd.length).toBe(usersAtStart.length)
        })

        test('name is missing', async () => {
            const usersAtStart = await User.find({})

            const newUser = {
                username: 'rooopt',
                password: 'otrrrr'
            }

            const result = await api.post('/api/users')
                .send(newUser)
                .expect(400)
                .expect('Content-Type', /application\/json/)

            expect(result.body.error).toContain('`name` is required.')

            const usersAtEnd = await User.find({})
            expect(usersAtEnd.length).toBe(usersAtStart.length)
        })

    })
})


afterAll(() => {
    mongoose.connection.close()
})