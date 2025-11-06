import ddb from "../db/dynamoClient";
import { PutCommand, GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { hashPassword, comparePassword } from "../auth/password";
import { v4 as uuidv4 } from "uuid";
import { emailPk, pk, sk } from "../db/tableUtils";

const Table = process.env.DDB_TABLE!;

export async function register(email: string, password: string) {
    const userId = uuidv4();
    const passwordHash = await hashPassword(password);

    const item = {
        PK: pk("user", userId),
        SK: sk("profile"),
        EmailPK: emailPk(email),
        GSI1PK: emailPk(email),
        GSI1SK: sk("profile"),
        id: userId,
        email,
        passwordHash,
    };

    await ddb.send(
        new PutCommand({
            TableName: Table,
            Item: item,
            ConditionExpression: "attribute_not_exists(EmailPK)",
        })
    );

    return item;
}

export async function login(email: string, password: string) {
    try {
        const q = new QueryCommand({
            TableName: Table,
            IndexName: "GSI1",
            KeyConditionExpression: "GSI1PK = :pk AND GSI1SK = :sk",
            ExpressionAttributeValues: {
                ":pk": emailPk(email),
                ":sk": sk("profile"),
            },
            Limit: 1,
        });

        const res: any = await ddb.send(q);
        const user = res.Items && res.Items[0];
        if (!user) return null;
        const ok = await comparePassword(password, user.passwordHash);
        return ok ? user : null;
    } catch (err) {
        return null;
    }
}

export async function getUserByEmail(email: string) {
    try {
        const q = new QueryCommand({
            TableName: Table,
            IndexName: "GSI1",
            KeyConditionExpression: "GSI1PK = :pk AND GSI1SK = :sk",
            ExpressionAttributeValues: {
                ":pk": emailPk(email),
                ":sk": sk("profile"),
            },
            Limit: 1,
        });
        const res: any = await ddb.send(q);
        return (res.Items && res.Items[0]) || null;
    } catch {
        return null;
    }
}
