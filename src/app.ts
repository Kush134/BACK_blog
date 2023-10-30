import express, {Express, json} from 'express';
import {authMiddleware} from './auth/auth-middleware';
import {authController} from './controller/auth/AuthController';
import {subscriptionController} from './controller/subscription/SubscriptionController';
import dotenv from 'dotenv';
import {telegramController} from './controller/telegram/TelegramController';
import {SiweMessage} from 'siwe';
import {profileController} from './controller/profile/ProfileControllerImpl';
import session from "express-session";
import {SessionStore} from "@/store/SessionStore";

const cors = require('cors');

dotenv.config();

declare module 'express-session' {
    interface SessionData {
        siwe: SiweMessage;
        nonce: string;
        ens: string;
        updated: boolean;
    }
}

const app: Express = express();
// todo fix it later
app.use(json({limit: "5mb"}));
app.use(cors({
    origin: ['http://localhost:3000', 'https://community-front-henna.vercel.app'],
    credentials: true,

}));

app.use(session({
    name: "siwe",
    secret: "siwe-secret", // change to env
    resave: false,
    rolling: false,
    saveUninitialized: false,
    store: new SessionStore({
        table: {
            name: "nodde-sessions"
        },
        touchInterval: 30000,
        ttl: 86400000
    }),
    cookie: {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    }
}));

app.get('/api/nonce', authController.getNonce);

app.post('/api/sign_in', authController.signIn);

app.post('/api/sign_out', authMiddleware.authorizeWallet, authController.signOut);

app.post('/profile/create', authMiddleware.authorizeWallet, profileController.create);

app.post('/profile/update', authMiddleware.authorizeWallet, profileController.update);

app.post('/profile/', profileController.profile);

app.post('/subscription/update', authMiddleware.authorizeWallet, subscriptionController.update);

app.post('/subscription/process-payment', authMiddleware.authorizeWallet, subscriptionController.processPayment);

app.post('/subscription/publish', authMiddleware.authorizeWallet, subscriptionController.publish);

app.post('/subscription/unpublish', authMiddleware.authorizeWallet, subscriptionController.unpublish);

app.post('/subscription/get-subscription-payment-status', authMiddleware.authorizeWallet, subscriptionController.getSubscriptionPaymentStatus);

app.post('/subscription/', subscriptionController.getSubscriptionDescription);

app.post('/telegram/get-invite-link-status', authMiddleware.authorizeWallet, telegramController.getInviteLinkStatus);

app.post('/telegram/generate-invite-code', authMiddleware.authorizeWallet, telegramController.generateInviteCode);

app.post('/telegram/bind-chat', authMiddleware.authorizeWallet, telegramController.bindChat);

app.post('/telegram/get-chat-binding-status', authMiddleware.authorizeWallet, telegramController.getChatBindingStatus);

app.use((_, res, _2) => {
    res.status(404).json({error: 'NOT FOUND'});
});

export {app}