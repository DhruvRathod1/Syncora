import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.DDB_REGION || "ap-south-1",
});
const ddb = DynamoDBDocumentClient.from(client);
export default ddb;
