import 'dotenv/config';
import { startServer } from './core/server.js';

const PORT = parseInt(process.env.PORT || '3000', 10);

startServer(PORT);
