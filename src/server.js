import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import morgan from 'morgan';
import cors from 'cors';
import fileUpload from 'express-fileupload';

import {dirname} from 'node:path';
import { fileURLToPath } from 'node:url';
import './models/index.js';

import Routes from './routes/index.js';
import {sequelize} from './config/postgres.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();

const logStream = fs.createWriteStream(
    path.join(__dirname, '../acess.log'),
    { flags: 'a'},
);

const corsOptions = {
    origin(origin, callback) {
        callback(null, true);
    },
    methods: 'GET, PUT, PATCH, DELETE, POST',
    credentials: true,
}

app.use(cors(corsOptions));
app.use(morgan('combined', { stream: logStream }));
app.use(express.json({limit: '50mb'})); //tamanho do corpo
app.use(fileUpload({
    createParentPath: true,
    safeFileNames: true,
    preserveExtension: true,
    uriDecodeFileNames: true,
    debug: true,
    limits: { fileSize: 50 * 1024 * 1024}
}));
app.use(express.static('public'));
app.use(express.urlencoded({extended: true, limit: '50mb'})); //tamanho da rota 

Routes(app);
app.use((req, res) => {
    res.status(404).send('404 - página não encontrada');
});

sequelize.authenticate()
    .then(() => {
        console.log('deu boa');
    });

app.listen(process.env.API_PORT, (e) => {
    if(e) {
        return console.log(e);
    }
    console.log(`rodando na url http://localhost:${process.env.API_PORT}`);
});