import {Request, Response} from "express"
import {toErrorResponse, toSuccessResponse} from "@/common";
import {SubscriptionDO, SubscriptionStatus} from "@/subscription/repository/subscription-repository";
import {subscriptionService} from "@/subscription/service/subscription-service";
import {apiError, unknownApiError} from "@/api/ApiResponse";
import {PublishSubscriptionRequest} from "@/controller/subscription/PublishSubscriptionRequest";
import {UnpublishSubscriptionRequest} from "@/controller/subscription/UnpublishSubscriptionRequest";
import {ProcessPaymentRequest} from "@/controller/subscription/ProcessPaymentRequest";
import {subscriptionContractService} from "@/subscription/service/contract/SubscriptionContractServiceImpl";
import * as console from "console";
import {
    GetSubscriptionPaymentStatusRequest,
    GetSubscriptionPaymentStatusResponse
} from "@/controller/subscription/GetSubscriptionPaymentStatusRequest";

export interface GetSubscriptionDescriptionRequest {
    subscriptionId: string
}

export interface GetSubscriptionDescriptionResponse {
    id: string,
    coin: string,
    description: string,
    instant: string,
    ownerId: string,
    price: string,
    status: SubscriptionStatus,
    title: string
    mainImageId: string,
    previewImageId: string,
}

export interface UpdateSubscriptionDTO {
    id: string;
    ownerId: string;
    status: SubscriptionStatus;
    title: string;
    description: string;
    mainImageId: string,
    previewImageId: string,
    price: string;
    coin: string;
}

export interface UpdateSubscriptionStatusDTO {
    id: string
}


export interface SubscriptionController {

    getSubscriptionPaymentStatus(req: Request, res: Response): Promise<void>

    getSubscriptionDescription(req: Request, res: Response): Promise<void>

    update(req: Request, res: Response): Promise<void>

    processPayment(req: Request, res: Response): Promise<void>

    publish(req: Request, res: Response): Promise<void>

    unpublish(req: Request, res: Response): Promise<void>
}

export class SubscriptionControllerImpl implements SubscriptionController {

    async getSubscriptionPaymentStatus(req: Request, res: Response): Promise<void> {
        try {

            console.log(`Start getSubscriptionPaymentStatus`);
            console.log(req.body);

            const request = req.body as GetSubscriptionPaymentStatusRequest;
            const subscriptionId = request.subscriptionId;
            const address = req.session.siwe.address;

            const result = await subscriptionContractService.findPaidSubscriptions(subscriptionId, address);

            let response: GetSubscriptionPaymentStatusResponse;
            if (result.length > 0) {
                response = {status: "PAID"}
            } else {
                response = {status: "NOT_PAID"}
            }

            res.json(response);
        } catch (err) {
            console.log(err?.toString());
            res.json(unknownApiError).status(500);
        }
    }

    async getSubscriptionDescription(req: Request, res: Response): Promise<void> {
        try {

            const body = req.body as GetSubscriptionDescriptionRequest;

            const subscriptionId = body.subscriptionId;
            if (!subscriptionId) {
                console.log(`Error, id is null: ${subscriptionId}`);
                res.send(toErrorResponse(`Error, id is null: ${subscriptionId}`));
                return
            }

            const subscription = await subscriptionService.getById(subscriptionId);

            if (!subscription) {
                console.log(`Can't find subscription with id: ${subscriptionId}`);
                res.send(toErrorResponse(`Can't find subscription with id: ${subscriptionId}`));
                return
            }

            const response: GetSubscriptionDescriptionResponse = {
                id: subscription.id,
                coin: subscription.coin,
                description: subscription.description,
                instant: subscription.instant,
                ownerId: subscription.ownerId,
                price: subscription.price,
                status: subscription.status,
                title: subscription.title,
                mainImageId: subscription.mainImageId,
                previewImageId: subscription.previewImageId,
            }

            res.send(toSuccessResponse(response));

        } catch (err) {
            console.error(err);
            res.json(unknownApiError).status(500);
        }

    }

    async update(req: Request, res: Response): Promise<void> {

        try {
            console.log('Start updating subscription');
            console.log(req.body);
            const updateSubscriptionRequest = req.body as UpdateSubscriptionDTO;

            const subscriptionId = updateSubscriptionRequest.id;
            if (!subscriptionId) {
                console.log("id is null");
                res.send({
                    status: "error",
                    errorMessage: "subId is null"
                });
                return;
            }

            const oldSubscription = await subscriptionService.getById(subscriptionId);

            const subscriptionForUpdate: SubscriptionDO = {
                id: subscriptionId,
                subscriptionId: '123', // todo fix it later
                ownerId: updateSubscriptionRequest.ownerId,
                status: updateSubscriptionRequest.status,
                title: updateSubscriptionRequest.title,
                description: updateSubscriptionRequest.description,
                mainImageId: updateSubscriptionRequest.mainImageId,
                previewImageId: updateSubscriptionRequest.previewImageId,
                price: updateSubscriptionRequest.price,
                coin: updateSubscriptionRequest.coin,
                instant: new Date().getTime().toString(),
            }
            await subscriptionService.put(subscriptionForUpdate);

            if (oldSubscription && oldSubscription.mainImageId !== subscriptionForUpdate.mainImageId) {
                await subscriptionService.removeImage(oldSubscription.mainImageId);
            }

            if (oldSubscription && oldSubscription.previewImageId !== subscriptionForUpdate.previewImageId) {
                await subscriptionService.removeImage(oldSubscription.previewImageId);
            }

            res.send(toSuccessResponse(subscriptionForUpdate))
        } catch (err) {
            console.error(err);
            res.json(unknownApiError).status(500);
        }
    }

    async processPayment(req: Request, res: Response): Promise<void> {
        try {

            const request = req.body as ProcessPaymentRequest;
            const subscriptionId = request.subscriptionId;
            const subscription = await subscriptionService.getById(subscriptionId);

            if (!subscription) {
                console.log(`Can't find subscription with id: ${subscriptionId}`);
                res.send(toErrorResponse(`Can't find subscription with id: ${subscriptionId}`));
                return
            }
            let status = subscription.status;
            if (status === 'UNPUBLISHED') {
                res.json({status: status});
                return;
            }

            if (!subscriptionService.isStatusTransitionAllowed(subscription.status, "PAYMENT_PROCESSING")) {
                res.json(apiError('bad_request', `Can\'t start process payment because subscription in status ${subscription.status}`)).status(400)
                return;
            }

            await subscriptionService.changeSubscriptionStatus(subscriptionId, "PAYMENT_PROCESSING");
            console.log(`Subscription ${subscriptionId} update status to PAYMENT_PROCESSING successfully`);
            status = "PAYMENT_PROCESSING";

            // Check status in blockchain
            try {
                const createdSubscriptionEvent = await subscriptionContractService.findSubscriptionCreations(subscriptionId);
                if (createdSubscriptionEvent.length > 0) {
                    await subscriptionService.changeSubscriptionStatus(subscriptionId, "UNPUBLISHED");
                    console.log(`Subscription ${subscriptionId} update status to UNPUBLISHED successfully`);
                    status = "UNPUBLISHED";
                }
            } catch (e) {
                console.warn(e);
            }


            res.json({status: status});
        } catch (err) {
            console.error(err);
            res.json(unknownApiError).status(500);
        }
    }

    async publish(req: Request, res: Response): Promise<void> {
        try {

            const request = req.body as PublishSubscriptionRequest;
            const subscriptionId = request.subscriptionId;
            const subscription = await subscriptionService.getById(subscriptionId);

            if (!subscription) {
                console.log(`Can't find subscription with id: ${subscriptionId}`);
                res.send(toErrorResponse(`Can't find subscription with id: ${subscriptionId}`));
                return
            }

            // add owner check
//            const address = req.session.siwe.address;
//            if (subscription.ownerAddress === address) {
//                return with error
//            }

            if (!subscriptionService.isStatusTransitionAllowed(subscription.status, "PUBLISHED")) {
                res.json(apiError('bad_request', `Can\'t publish the subscription from this ${subscription.status} status`)).status(400)
                return;
            }

            await subscriptionService.changeSubscriptionStatus(subscriptionId, "PUBLISHED");
            console.log(`Subscription ${subscriptionId} successfully published`);
            res.json({status: 'success'});
        } catch (err) {
            console.error(err);
            res.json(unknownApiError).status(500);
        }
    }

    async unpublish(req: Request, res: Response): Promise<void> {
        try {

            const request = req.body as UnpublishSubscriptionRequest;
            const subscriptionId = request.subscriptionId;
            const subscription = await subscriptionService.getById(subscriptionId);

            if (!subscription) {
                console.log(`Can't find subscription with id: ${subscriptionId}`);
                res.send(toErrorResponse(`Can't find subscription with id: ${subscriptionId}`));
                return
            }

            if (!subscriptionService.isStatusTransitionAllowed(subscription.status, "UNPUBLISHED")) {
                res.json(apiError('bad_request', `Can\'t publish the subscription from this ${subscription.status} status`)).status(400)
                return;
            }

            await subscriptionService.changeSubscriptionStatus(subscriptionId, "UNPUBLISHED");
            console.log(`Subscription ${subscriptionId} successfully published`);
            res.json({status: 'success'});
        } catch (err) {
            console.error(err);
            res.json(unknownApiError).status(500);
        }
    }

}

const subscriptionController: SubscriptionController = new SubscriptionControllerImpl()
export {subscriptionController}