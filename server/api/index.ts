const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');
const bodyParser = require('body-parser')
const {mongoose} = require('mongoose');

//start server
const app = express()
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())
app.use('/', require('../routes/authroutes'))

//mongoDB connection
mongoose.connect(process.env.MONGO_URL)
.then(() => {
    console.log("mongoDB connected")
})
.catch((err) => {
    console.log("failed to connect", err)
})

const port = process.env.PORT || 8000;
const host = process.env.HOST || 'localhost'

app.listen(port, function () {
    console.log("Server Has Started!");
    console.log(`Server is running at http://${host}:${port}`)
});

module.exports = app;
