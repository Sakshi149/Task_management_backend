const express = require('express')
const morgan = require('morgan')
const dotenv = require('dotenv');
const mySqlPool = require('./config/db');

// Configure dotenv
dotenv.config();

// rest object
const app = express()

// middlewares
app.use(morgan('dev'))
app.use(express.json())

// routes
app.use('/api/v1/task', require("./routes/taskRoutes"))

app.get('/tasks', (req, res) => {
    res.status(200).send('<h1>Nodejs Mysql App</h1>')
})

// port
const port = process.env.port || 8000

// conditionaly listen
mySqlPool.query('SELECT 1').then(() => {
    // My sql
    console.log('MySQL DB Connected')
    // listen
    app.listen(port, () => {
        console.log(`Server Running on port ${process.env.port}`)
    })
}).catch((error) => {
    console.log(error)
})
