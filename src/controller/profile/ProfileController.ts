import { Request, Response } from "express";

export interface ProfileController {

    create(req: Request, res: Response): Promise<void>

    update(req: Request, res: Response): Promise<void>

    profile(req: Request, res: Response): Promise<void>

}