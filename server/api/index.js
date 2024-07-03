const express = require('express');
require('dotenv').config();
const cors = require('cors');
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const {mongoose} = require('mongoose');

//start server
const app = express()

//middlewares
app.use(express.json())
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: false }))
//cors plugin
app.use(cors({credentials: true, origin: process.env.FRONTEND_SERVER}))
//routes
app.use('/', require('../routes/authroutes'))
//cors origin
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', process.env.FRONTEND_SERVER);
    res.header('Access-Control-Allow-Credentials', true)
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
