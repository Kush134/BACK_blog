import {BriefSubscriptionInfo} from "@/subscription/service/subscription-service";
import {BaseProfileDTO} from "@/controller/profile/UpdateProfileResponse";

export interface GetProfileResponse extends BaseProfileDTO {
    subscriptions: BriefSubscriptionInfo[],
}