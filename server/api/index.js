const express = require('express');
require('dotenv').config();
const cors = require('cors');
const bodyParser = require('body-parser')
const {mongoose} = require('mongoose');
const cookieParser = require('cookie-parser');

//start server
const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({extended: false}))
//app.use(bodyParser.urlencoded({ extended: true }))

//cors plugin
app.use(cors())
//routes
app.use('/', require('../routes/authroutes'))
//cors origin
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    //res.header('Access-Control-Allow-Origin', 'https://book-brawl-backend.vercel.app');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

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