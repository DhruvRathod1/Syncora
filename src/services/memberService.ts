import ddb from "../db/dynamoClient";
import { PutCommand, QueryCommand, GetCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const Table = process.env.DDB_TABLE!;

export async function addMember(boardId: string, userId: string, role: "OWNER" | "EDITOR" | "VIEWER", userEmail?: string) {
    const boardPk = `BOARD#${boardId}`;
    const item = {
        PK: boardPk,
        SK: `MEMBER#${userId}`,
        boardId,
        userId,
        role,
        userEmail,
    };
    await ddb.send(new PutCommand({ TableName: Table, Item: item }));
    // Optional: write inverse for user -> board lookups
    const userItem = {
        PK: `USER#${userId}`,
        SK: `BOARD#${boardId}#MEMBER`,
        boardId,
        userId,
        role,
        userEmail,
    };
    await ddb.send(new PutCommand({ TableName: Table, Item: userItem }));
    return item;
}

export async function getMembers(boardId: string) {
    const q = new QueryCommand({
        TableName: Table,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
        ExpressionAttributeValues: {
            ":pk": `BOARD#${boardId}`,
            ":sk": "MEMBER#",
        },
    });
    const res: any = await ddb.send(q);
    return res.Items || [];
}

export async function inviteMember(boardId: string, boardTitle: string, inviterId: string, inviteeId: string, inviteeEmail: string, role: "OWNER" | "EDITOR" | "VIEWER") {
    // Store pending invite under both user and board for listing
    const userInvite = {
        PK: `USER#${inviteeId}`,
        SK: `INVITE#BOARD#${boardId}`,
        boardId,
        boardTitle,
        inviterId,
        inviteeId,
        inviteeEmail,
        role,
        status: "PENDING",
    };
    const boardInvite = {
        PK: `BOARD#${boardId}`,
        SK: `INVITE#${inviteeId}`,
        boardId,
        boardTitle,
        inviterId,
        inviteeId,
        inviteeEmail,
        role,
        status: "PENDING",
    };
    await ddb.send(new PutCommand({ TableName: Table, Item: userInvite }));
    await ddb.send(new PutCommand({ TableName: Table, Item: boardInvite }));
    return userInvite;
}

export async function getInvitesForUser(userId: string) {
    const q = new QueryCommand({
        TableName: Table,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
        ExpressionAttributeValues: {
            ":pk": `USER#${userId}`,
            ":sk": "INVITE#",
        },
    });
    const res: any = await ddb.send(q);
    return res.Items || [];
}

export async function acceptInvite(userId: string, boardId: string) {
    const userKey = { PK: `USER#${userId}`, SK: `INVITE#BOARD#${boardId}` };
    const getRes: any = await ddb.send(new GetCommand({ TableName: Table, Key: userKey }));
    const invite = getRes.Item;
    if (!invite) throw new Error("Invite not found");
    // Add member with stored role and email
    const member = await addMember(boardId, userId, invite.role, invite.inviteeEmail);
    // Delete pending invites
    await ddb.send(new DeleteCommand({ TableName: Table, Key: userKey }));
    await ddb.send(new DeleteCommand({ TableName: Table, Key: { PK: `BOARD#${boardId}`, SK: `INVITE#${userId}` } }));
    return member;
}

export async function rejectInvite(userId: string, boardId: string) {
    const userKey = { PK: `USER#${userId}`, SK: `INVITE#BOARD#${boardId}` };
    await ddb.send(new DeleteCommand({ TableName: Table, Key: userKey }));
    await ddb.send(new DeleteCommand({ TableName: Table, Key: { PK: `BOARD#${boardId}`, SK: `INVITE#${userId}` } }));
    return true;
}
