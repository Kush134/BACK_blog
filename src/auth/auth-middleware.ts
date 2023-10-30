import {Request, Response, NextFunction} from "express";

export class AuthMiddleware {

    constructor() {}

    async authorizeWallet(req: Request, res: Response, next: NextFunction) {

        if (!req.session.siwe) {
            res.status(401).json({message: 'You have to first sign_in'});
            return;
        }

        next()
        return;
    }
}

const authMiddleware = new AuthMiddleware();
export {authMiddleware}