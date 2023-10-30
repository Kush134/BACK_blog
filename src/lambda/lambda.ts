import { LambdaClient } from "@aws-sdk/client-lambda";
import { AWS_REGION } from "../common";

export const lambda = new LambdaClient({ region: AWS_REGION })