
export interface GetSubscriptionPaymentStatusRequest {
    subscriptionId: string
}

export interface GetSubscriptionPaymentStatusResponse {
    status: SubscriptionPaymentStatus
}

export type SubscriptionPaymentStatus = "PAID" | "NOT_PAID";