// Setting up the database connection
const knex = require('knex')({
    client: 'mysql',
    connection:{
        user: 'foo',
        password: 'Ch1ck3nr1c3!',
        database: 'organic'
    }
})

const bookshelf = require('bookshelf')(knex)

module.exports = bookshelf;