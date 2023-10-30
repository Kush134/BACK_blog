import {Request, Response} from "express";
import {SiweErrorType, SiweMessage, generateNonce} from "siwe";
import {unknownApiError} from "@/api/ApiResponse";
import {SignInRequest} from "@/controller/auth/SignInRequest";

export interface AuthController {

    getNonce(req: Request, res: Response): Promise<void>

    signIn(req: Request, res: Response): Promise<void>

    signOut(req: Request, res: Response): Promise<void>

}

export class AuthControllerImpl implements AuthController {

    async getNonce(req: Request, res: Response): Promise<void> {
        try {
            req.session.nonce = generateNonce();
            req.session.save(() => res.status(200).send(req.session.nonce).end());
        } catch (err) {
            console.error(err);
            res.json(unknownApiError).status(500);
        }
    }

    async signIn(req: Request, res: Response): Promise<void> {
        try {

            const {message, signature} = req.body as SignInRequest;
            if (!message) {
                res.status(422).json({message: 'Expected signMessage object as body.'});
                return;
            }

            const siweMessage = new SiweMessage(message);

            const {data: fields} = await siweMessage.verify({signature, nonce: req.session.nonce});

            if (fields.nonce !== req.session.nonce) {
                res.status(422).json({message: 'Invalid nonce.'});
                return;
            }

            req.session.siwe = fields;
            req.session.nonce = null;
            await req.session.save();
            res.json({ok: true});
        } catch (e) {
            req.session.siwe = null;
            req.session.nonce = null;
            req.session.ens = null;
            console.error(e);
            let err = e as Error
            switch (e) {
                case SiweErrorType.EXPIRED_MESSAGE: {
                    req.session.save(() => res.status(440).json({message: err.message}));
                    break;
                }
                case SiweErrorType.INVALID_SIGNATURE: {
                    req.session.save(() => res.status(422).json({message: err.message}));
                    break;
                }
                default: {
                    req.session.save(() => res.status(500).json({message: err.message}));
                    break;
                }
            }
        }
    }

    async signOut(req: Request, res: Response): Promise<void> {
        try {
            req.session.destroy(() => res.status(205).send());
        } catch (err) {
            console.error(err);
            res.status(200).json(unknownApiError);
        }
    }

}

const authController: AuthController = new AuthControllerImpl()
export {authController}