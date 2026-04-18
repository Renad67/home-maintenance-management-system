import express from 'express';
import { bootstrap } from './app.bootstrap.js';

const app = express();
const PORT = process.env.PORT || 3000;

bootstrap(app);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});