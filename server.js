import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import errorHandler from './utils/error-handler.js';
import apiRouter from './router/apiRouter.js';
import dotenv from 'dotenv'; // Import dotenv pour charger les variables d'environnement

// Charger les variables d'environnement depuis le fichier .env
dotenv.config();

// Instanciate Express Server
const server = express();

// Body Parser and Security configuration
server.use(express.urlencoded({ extended: false }));
server.use(express.json());
server.use(helmet());

// Cors configuration
server.use(cors());

// Routes configuration
server.use('/api', apiRouter);
server.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send('<h1>REST API for SONABHY Personal SONAGEC System By SONABHY(BURK)</h1>');
});

// Global error handler
server.use(errorHandler);

// Start server
const port = process.env.NODE_ENV === 'production' ? 80 : process.env.PORT || 4000;
const app = server.listen(port, () => {
    console.log('SONAGEC-Server listening on port ' + port);
}).on('error', (err) => {
    console.error('Failed to start server:', err);
});
