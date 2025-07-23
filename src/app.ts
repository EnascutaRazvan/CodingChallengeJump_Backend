require('dotenv').config({ path: ".env" });
import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';

import cors from 'cors'

const orientCRUDService = require('../database/crud.service');


import CustomError from '../customError'
global.CustomError = CustomError;

// -------------------- ROUTERS --------------------------
import challenge from './apis/challenge/challenge'
// -------------------- ROUTERS --------------------------

// -------------------- SERVICES --------------------------

import challengeService from './apis/challenge/challenge.service';

// -------------------- SERVICES --------------------------


const app = express();


app.use(cors());

app.use(function (req: any, res: any, next) {
    let fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    console.log(fullUrl);
    next();
});
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use("/public", express.static(process.env.PUBLIC_FILES_PREFIX + 'public'))

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Content-Security-Policy", "frame-ancestors *");

    res.header("Access-Control-Allow-Methods", "DELETE,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token, x-auth-token");
    next();
});

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Service working!' });
});

app.use("/challenge", challenge)



app.use(function (req: any, res: any, next) {
    if ('OPTIONS' == req.method) {
        res.set('Access-Control-Max-Age', '7200');
        res.sendStatus(200);
    } else {
        res.sendStatus(404)
    }
});

async function errorHandler(err, req, res, next) {
    const email = req.decoded ? req.decoded.email : "";
    console.log("error key: " + err.key);
    console.error(err.stack);

    res.status(err.status || 500).json({
        name: err.name,
        message: err.message,
        key: err.key,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })

    });

}

app.use(errorHandler);

const server = http.createServer(app);

const PORT = parseInt(process.env.PORT || '3000', 10); // Convert PORT to number with fallback

server.listen(PORT, async () => {
    console.log(`Server running on PORT ${PORT}`);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
})
    .on('uncaughtException', err => {
        console.error(err, 'Uncaught Exception thrown');
        process.exit(1);
    });