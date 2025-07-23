export default class CustomError extends Error {
    public key: string;
    constructor(message: string, key: string) {
        super(message);
        this.name = this.constructor.name;
        this.key = key;
        Error.captureStackTrace(this, this.constructor);
    }
}
