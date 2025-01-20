import express from 'express';
import cors from 'cors';

const app = express();

// Configure CORS
app.use(cors({
    origin: 'https://your-frontend-domain.com', // Replace with your frontend domain
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Your existing routes
app.get('/api/data', (_req, res) => {
    res.json({ message: 'CORS is configured correctly!' });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
}); 