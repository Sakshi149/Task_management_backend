import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mySqlPool from './config/db.js'; 
import taskRoutes from './routes/taskRoutes.js';

// Configure dotenv
dotenv.config();

// rest object
const app = express()

// middlewares
app.use(morgan('dev'))
app.use(express.json())

// routes
app.use('/api/v1/tasks', taskRoutes)

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

export default app