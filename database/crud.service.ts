let CustomError = require('../customError');
const { OrientDBClient } = require("orientjs");
import { performance } from 'perf_hooks';
import chalk from 'chalk';
const fsp = require('fs').promises;

class OrientCRUDService {
    private static instance: OrientCRUDService;
    private static havePool = false;
    private static poolObject: { [key: string]: any } = {};
    private static inProgress = false;

    private constructor() {
        if (!OrientCRUDService.havePool) {
            OrientCRUDService.havePool = true;
            OrientCRUDService.initPool();
        }
    }

    public static getInstance(): OrientCRUDService {
        if (!OrientCRUDService.instance) {
            OrientCRUDService.instance = new OrientCRUDService();
        }
        return OrientCRUDService.instance;
    }

    private static async initPool() {
        if (!OrientCRUDService.inProgress) {
            OrientCRUDService.inProgress = true;
            const t0 = performance.now();

            const client = await OrientDBClient.connect({
                host: process.env.ORIENT_IP,
                port: process.env.ORIENT_PORT
            });

            const pool = await client.sessions({
                name: process.env.ORIENT_DB_NAME,
                username: process.env.ORIENT_USER,
                password: process.env.ORIENT_PASS,
                pool: { max: 20 }
            });

            OrientCRUDService.poolObject["main"] = pool;
            OrientCRUDService.inProgress = false;

            const t1 = performance.now();
            const executionTime = t1 - t0;
            console.log(chalk.greenBright("CONNECTION ORIENT DATABASE INITED TIME: " + OrientCRUDService.round2Decimals(executionTime) + " ms"));
        } else {
            console.log("Another initialization in progress ...");
        }
    }

    public async executeSelect(sql: string, params: any = {}) {
        let result = null;
        console.log(sql, params);

        try {
            let session = await OrientCRUDService.poolObject["main"].acquire();
            const t0 = performance.now();
            result = await session.query(sql, { params }).all();
            const t1 = performance.now();
            const executionTime = t1 - t0;

            if (executionTime > parseInt(process.env.DISCORD_RUNTIME_LIMIT_MS)) {
                console.log(chalk.red("TIME: " + OrientCRUDService.round2Decimals(executionTime) + " ms"));
            }

            session.close();
        } catch (err) {
            if (err.message.includes("Cannot select the server") || err.message.includes("Cannot read property 'acquire' of null")) {
                console.log(chalk.red("ORIENT connection lost!"));
                OrientCRUDService.poolObject["main"] = null;
                await OrientCRUDService.initPool();
                return await this.executeSelect(sql, params);
            } else {
                throw new global.CustomError(err.message, 'ORIENTDB_SELECT');
            }
        }

        return result;
    }

    public async executeCUD(sql: string, params: any = {}) {
        let result;

        console.log(sql, params);
        try {
            let session = await OrientCRUDService.poolObject["main"].acquire();
            const t0 = performance.now();
            result = await session.command(sql, { params }).all();
            const t1 = performance.now();
            const executionTime = t1 - t0;

            if (executionTime > parseInt(process.env.DISCORD_RUNTIME_LIMIT_MS)) {
                console.log(chalk.red("TIME: " + OrientCRUDService.round2Decimals(executionTime) + " ms"));
            }

            session.close();
        } catch (err) {
            if (err.message.includes("Cannot select the server")) {
                console.log(chalk.red("ORIENT connection lost!"));
                OrientCRUDService.poolObject["main"] = null;
                await OrientCRUDService.initPool();
                return await this.executeCUD(sql, params);
            } else {
                throw new global.CustomError(err.message, 'ORIENTDB_SELECT');
            }
        }

        return result;
    }

    private static round2Decimals(value: number) {
        return Math.round(value * 100) / 100;
    }
}

export default OrientCRUDService.getInstance();

