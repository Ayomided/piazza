const express = require('express')
const app = express()

const mongoose = require('mongoose')
const bodyparser = require('body-parser')
require('dotenv/config')

app.use(bodyparser.json())

const postRoute = require('./src/routes/post')
const authRoute = require('./src/routes/auth')

app.use('/api/v1/posts', postRoute)
app.use('/api/v1/auth', authRoute)

app.get('/status', async (req, res) => {
    res.send('Piazza Homepage - API is up and running')
})

mongoose.connect(process.env.DB_CONNECTOR).then(() => {
    console.log('DB Connected')
})

app.listen(3000, () => {
    console.log('Server is running')
})