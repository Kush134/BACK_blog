export interface SignInRequest {
    message: {
        domain: string,
        address: string,
        statement: string,
        uri: string,
        version: string,
        chainId: number,
        nonce: string,
        issuedAt: string,
    },
    signature: string,
}