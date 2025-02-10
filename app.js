import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cors from 'cors';
import mySqlPool from './config/db.js'; 
import taskRoutes from './routes/taskRoutes.js';

// Configure dotenv
dotenv.config();

// rest object
const app = express();

// middlewares
app.use(morgan('dev'));
app.use(express.json());
app.use(cors());

// routes
app.use('/api/v1/tasks', taskRoutes);

// port
const port = process.env.PORT || 8000;

// Conditionally listen for MySQL connection
mySqlPool.query('SELECT 1')
    .then(() => {
        console.log('MySQL DB Connected');
        app.listen(port, () => {
            console.log(`Server Running on port ${port}`);
        });
    })
    .catch((error) => {
        console.error('Database Connection Failed:', error);
    });

export default app;
