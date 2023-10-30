import {InvokeCommand, InvokeCommandInput, InvokeCommandOutput, LogType} from "@aws-sdk/client-lambda"
import {lambda} from "./lambda"

export const invokeLambda = async (name: string, body: any): Promise<InvokeCommandOutput> => {

    const input: InvokeCommandInput = {
        FunctionName: name,
        InvocationType: "RequestResponse",
        Payload: Buffer.from(JSON.stringify(body), 'utf-8'),
        LogType: LogType.Tail
    }

    const command = new InvokeCommand(input)
    return await lambda.send(command);
}

export function getJsonFromLambdaResponse(output: InvokeCommandOutput): any {
    return JSON.parse(Buffer.from(output.Payload!).toString('utf-8'));
}