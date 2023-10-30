import {InvokeCommandOutput} from "@aws-sdk/client-lambda";

export interface TelegramService {
    
    bindChat(code: string, address: string, subscriptionId: string): Promise<InvokeCommandOutput>
    
    getInviteLinkStatus(address: string, subscriptionId: string): Promise<InvokeCommandOutput>
    
    generateInviteCode(address: string, subscriptionId: string): Promise<InvokeCommandOutput>
    
    getChatBindingStatus(address: string, subscriptionId: string): Promise<InvokeCommandOutput>
    
}