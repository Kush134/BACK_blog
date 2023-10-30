import {
    DeleteObjectCommand,
    DeleteObjectCommandInput,
    GetObjectCommand,
    GetObjectCommandInput,
    PutObjectCommand,
    PutObjectCommandInput
} from "@aws-sdk/client-s3";
import {s3} from "./s3";
import {randomUUID} from "crypto";
import * as console from "console";

export interface Image {
    id: string,
    base64Data: string
}

export const getImage = async (bucket: string, id: string): Promise<Image | undefined> => {

    console.log(`Start getting image with ${id}`);

    const input: GetObjectCommandInput = {
        Bucket: bucket,
        Key: id
    }

    const result = await s3.send(new GetObjectCommand(input));

    if (!result.Body) {
        console.log(`Can't find image with id ${id}`);
        return undefined;
    }

    console.log(`Found image with id ${id}`);

    return {
        id: id,
        base64Data: `data:${result.ContentType};base64,${await result.Body.transformToString('base64')}`
    }
}

export const save = async (bucket: string, base64Image: string): Promise<string> => {

    console.log(`Start saving new image with ${base64Image.substring(0, 20)}`);

    const type: string = base64Image.substring("data:image/".length, base64Image.indexOf(";base64"));

    const input: PutObjectCommandInput = {
        Bucket: bucket,
        Key: randomUUID().toString(),
        Body: base64StringToBuffer(base64Image),
        ContentEncoding: 'base64',
        ContentType: `image/${type}`
    };

    const command: PutObjectCommand = new PutObjectCommand(input);

    await s3.send(command);

    console.log(`New image saved ${input.Key}`);

    return input.Key;
}

export const remove = async (bucket: string, id: string): Promise<void> => {

    console.log(`Start removing image with id ${id}`);

    const input: DeleteObjectCommandInput = {
        Bucket: bucket,
        Key: id,
    };

    await s3.send(new DeleteObjectCommand(input));
    console.log(`Image with id ${id} was removed`);
}

export const update = async (bucket: string, id: string, newBase64Image: string): Promise<void> => {
    console.log(`Start updating image with id ${id}`);

    const currentImage = await getImage(bucket, id);
    if (!currentImage) {
        console.log(`No image found for id ${id}`);
        return;
    }

    if (newBase64Image === currentImage.base64Data) {
        console.log(`Old and new image for id ${id} are equal`);
        return;
    }

    const type: string = newBase64Image.substring("data:image/".length, newBase64Image.indexOf(";base64"));

    const input: PutObjectCommandInput = {
        Bucket: bucket,
        Key: id,
        Body: base64StringToBuffer(newBase64Image),
        ContentEncoding: 'base64',
        ContentType: `image/${type}`
    };

    const command: PutObjectCommand = new PutObjectCommand(input);

    await s3.send(command);

    console.log(`Finish updating image with id ${id}`);
}

function base64StringToBuffer(base64String: string): Buffer {
    return Buffer.from(base64String.replace(/^data:image\/\w+;base64,/, ""), "base64");
}
