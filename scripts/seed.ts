import ddb from "../src/db/dynamoClient";
import { v4 as uuid } from "uuid";
import { PutCommand } from "@aws-sdk/lib-dynamodb";

const Table = process.env.DDB_TABLE!;

async function seed() {
  const userId = uuid();
  await ddb.send(
    new PutCommand({
      TableName: Table,
      Item: { PK: `USER#${userId}`, SK: "PROFILE", email: "demo@user.com", passwordHash: "demo" },
    })
  );

  const boardId = uuid();
  await ddb.send(
    new PutCommand({
      TableName: Table,
      Item: { PK: `BOARD#${boardId}`, SK: "META", title: "Demo Board", ownerId: userId },
    })
  );

  console.log("✅ Seeded user and demo board");
}

seed().catch(console.error);
