import { GetItemCommand, GetItemCommandInput, PutItemCommand, PutItemCommandInput } from "@aws-sdk/client-dynamodb";
import { ProfileDO } from "./ProfileDO";
import { ProfileRepository } from "./ProfileRepository";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { documentClient } from "@/db/dynamo";
import {QueryCommand, QueryCommandInput} from "@aws-sdk/lib-dynamodb";

export class ProfileRepositoryImpl implements ProfileRepository {

    private table = 'Community-profile';

    async getByAddress(address:string): Promise<ProfileDO | undefined> {
        console.log(`Start get profile by address ${address}`);

        const input: QueryCommandInput = {
            TableName: this.table,
            Limit: 2,
            KeyConditionExpression: 'address = :a',
            ExpressionAttributeValues: {
                ':a': address
            }
        }

        const result = await documentClient.send(new QueryCommand(input));

        if (!result.Items || result.Items.length === 0) {
            console.warn(`No items found for address ${address}`);
            return undefined;
        }

        if (result.Items.length > 1) {
            throw new Error(`Found several profiles for address ${address}`);
        }

        return unmarshall(result.Items[0]) as ProfileDO;
    }

    async getById(id: string): Promise<ProfileDO | undefined> {
        console.log(`Start get profile ${id}`);

        const input: GetItemCommandInput = {
            TableName: this.table,
            Key: marshall({id: id})
        }
        const result = await documentClient.send(new GetItemCommand(input));

        if (!result.Item) {
            console.log(`Profile not found ${id}`);
            return undefined;
        }

        const profile = unmarshall(result.Item) as ProfileDO;
        console.log(`Got profile`);
        console.log(profile);
        return profile;
    }

    async put(profile: ProfileDO): Promise<void> {

        console.log(`Start save profile ${profile}`);

        const input: PutItemCommandInput = {
            TableName: this.table,
            Item: marshall(profile)
        };

        await documentClient.send(new PutItemCommand(input));

        console.log(`Profile saved ${profile}`);
    }
}

const profileRepository: ProfileRepository = new ProfileRepositoryImpl()
export {profileRepository}