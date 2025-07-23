import express, { Request, Response } from "express";
import wrapAsync from "../../helpers/wrapAsync";
import challengeService from "./challenge.service";



const Router = express.Router();

Router.get('/', wrapAsync(async (req: any, res: Response) => {

    const result = await challengeService.service1();

    res.status(200).json(result);
}));

Router.patch('/:id/:type', wrapAsync(async (req: any, res: Response) => {
    const { id, type } = req.params
    const { amount } = req.body;

    await challengeService.service2(id, type, amount);

    return res.status(200).json({ message: "good" });
}));

Router.patch('/income', wrapAsync(async (req: any, res: Response) => {
    const { amount } = req.body;

    await challengeService.service3(amount);

    return res.status(200).json({ message: "good" });
}));


Router.post('/', wrapAsync(async (req: any, res: Response) => {
}));

Router.put('/:id', wrapAsync(async (req: any, res: Response) => {

}));


Router.delete('/:id', wrapAsync(async (req: any, res: Response) => {
}));






export default Router