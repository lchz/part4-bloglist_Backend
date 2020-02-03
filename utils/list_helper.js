
const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    const reducer = (sum, blog) => {
        return sum + blog.likes
    }

    return blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
    let i = 0
    let index = 0
    
    for (i = 0; i < blogs.length; i++) {

        if (blogs[index].likes !== Math.max(blogs[index].likes, blogs[i].likes)) {
            index = i
        }
    }

    const favorite = {
        title: blogs[index].title,
        author: blogs[index].author,
        likes: blogs[index].likes
    }

    return favorite
}

const mostBlogs = (blogs) => {
    const authors = refactoring(blogs)

    let index = 0
    
    for (i = 0; i < authors.length; i++) {

        if (authors[index].blogs !== Math.max(authors[index].blogs, authors[i].blogs)) {
            index = i
        }
    }

    return {author: authors[index].author, blogs: authors[index].blogs}
}

const mostLikes = (blogs) => {
    const authors = refactoring(blogs)

    let index = 0
    
    for (i = 0; i < authors.length; i++) {

        if (authors[index].likes !== Math.max(authors[index].likes, authors[i].likes)) {
            index = i
        }
    }

    return {author: authors[index].author, likes: authors[index].likes}
}

/** Help function */

const refactoring = (blogs) => {
    let authors = []

    for (i = 0; i < blogs.length; i++) {
        const author = authors.find(a => a.author === blogs[i].author)

        if (author) {
            const changed = {...author, blogs: author.blogs+1, likes: author.likes += blogs[i].likes}
            authors = authors.map(a => a.author === author.author ? changed : a)

        } else {
            const newAuthor = {
                author: blogs[i].author,
                blogs: 1,
                likes: blogs[i].likes
            }

            authors.push(newAuthor)
        }
    }

    return authors
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}