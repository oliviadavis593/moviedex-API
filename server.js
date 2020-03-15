require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const MOVIES = require('./movie-data.json')

//console.log(process.env.API_TOKEN)

const app = express()


const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common'
app.use(morgan(morganSetting))
app.use(helmet())
app.use(cors())

//only used when initializing express app 
/*
app.use((req, res) => {
    res.send('Hello, world!')
})
*/


app.use(function validateBearerToken(req, res, next) {
    console.log('validate bearer token middleware')

    //console.log(req.get('Authorization'))
    //console.log(req.get('Authorization').split(' '))
    //console.log(req.get('Authorization').split(' ')[1])

    const authToken = req.get('Authorization')
    const apiToken = process.env.API_TOKEN

    if(!authToken || authToken.split(' ')[1] !== apiToken) {
        return res.status(401).json({ error: 'Unauthorized request'}) //both invalid requests will now work
    }
    
    //move to the next middleware
    next()
})

//hardcoded array of genres for testing in Postman 
const validGenres = [`Animation`, `Drama`, `Comedy`, `Spy`, `Crime`, `Thriller`, `Adventure`, `Documentary`, `Horror`]

function handleGetGenre(req, res) {
    res.json(validGenres)
}

app.get('/genre', handleGetGenre)

app.get('/movie', function handleGetMovie(req, res) {
    let response = MOVIES; 

    if (req.query.genre) {
        response = response.filter(movie => 
            movie.genre.toLowerCase().includes(req.query.genre.toLowerCase())    
        )
    }

    if (req.query.country) {
        response = response.filter(movie => 
            movie.country.toLowerCase().includes(req.query.country.toLowerCase())    
        )
    }

    if (req.query.avg_vote) {
        response = response.filter(movie => 
            Number(movie.avg_vote) >= Number(req.query.avg_vote)    
        )
    }

    res.json(response)

})

//friendly error-handling middleware 
app.use((error, req, res, next)  => {
    let response 
    if (process.env.NODE_ENV === 'production') {
        response = { error: { message: 'server error' }}
    } else {
        response = { error }
    }
    res.status(500).json(response)
})

const PORT = process.env.PORT || 8000

app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`)
})