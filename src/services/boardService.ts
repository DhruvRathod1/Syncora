import ddb from "../db/dynamoClient";
import { PutCommand, QueryCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuid } from "uuid";
import { pk, sk, memberKey } from "../db/tableUtils";

const Table = process.env.DDB_TABLE!;

export async function createBoard(title: string, ownerId: string) {
    const id = uuid();
    const boardPk = `BOARD#${id}`;
    const boardItem = {
        PK: boardPk,
        SK: "META",
        id,
        title,
        ownerId,
    };
    await ddb.send(new PutCommand({ TableName: Table, Item: boardItem }));
    // create membership entry under the user partition so we can query boards by user
    const member = {
        PK: `USER#${ownerId}`,
        SK: `BOARD#${id}`,
        boardId: id,
        userId: ownerId,
        role: "owner",
        boardTitle: title,
    };
    await ddb.send(new PutCommand({ TableName: Table, Item: member }));
    return boardItem;
}

export async function getBoardsByOwner(ownerId: string) {
    // Query membership entries under PK = USER#<ownerId>
    const q = new QueryCommand({
        TableName: Table,
        KeyConditionExpression: "PK = :pk",
        ExpressionAttributeValues: { ":pk": `USER#${ownerId}` },
        Limit: 100,
    });
    try {
        const res: any = await ddb.send(q);
        // map membership entries to board objects (boardId + title if available)
        return (res.Items || []).map((m: any) => ({ id: m.boardId, title: m.boardTitle || "Untitled" }));
    } catch (err) {
        return [];
    }
}

export async function createTask(boardId: string, text: string, createdBy: string) {
    const id = uuid();
    const item = {
        PK: `BOARD#${boardId}`,
        SK: `TASK#${id}`,
        id,
        boardId,
        text,
        status: "TODO",
        createdBy,
    };
    await ddb.send(new PutCommand({ TableName: Table, Item: item }));
    return item;
}

export async function getTasksForBoard(boardId: string) {
    const q = new QueryCommand({
        TableName: Table,
        KeyConditionExpression: "PK = :pk",
        ExpressionAttributeValues: { ":pk": `BOARD#${boardId}` },
        Limit: 100,
    });
    try {
        const res: any = await ddb.send(q);
        return res.Items || [];
    } catch (err) {
        return [];
    }
}

export async function getBoardMeta(boardId: string) {
    try {
        const res: any = await ddb.send(
            new GetCommand({ TableName: Table, Key: { PK: `BOARD#${boardId}`, SK: "META" } })
        );
        return res.Item || null;
    } catch {
        return null;
    }
}
