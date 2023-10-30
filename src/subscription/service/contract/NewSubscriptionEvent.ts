
export interface NewSubscriptionEvent {
    hexId: string,
    participant: string,
    author: number,
    subscriptionId: number,
    subscriptionEndTime: number,
    tokenAddress: string,
    amount: string,
}