import {documentClient} from "./dynamo";
import {ScanCommand, ScanCommandOutput} from "@aws-sdk/lib-dynamodb";

export const scanTable = async (tableName: string): Promise<any[]> => {
    let input: any = {
        TableName: tableName
    }

    const scanResults: any[] = []
    let items: ScanCommandOutput

    do {
        items = await documentClient.send(new ScanCommand(input))
        items.Items?.forEach((item) => scanResults.push(item))
        input = {
            TableName: tableName,
            ExclusiveStartKey: items.LastEvaluatedKey
        }
    } while (typeof items.LastEvaluatedKey !== "undefined")

    return scanResults
}