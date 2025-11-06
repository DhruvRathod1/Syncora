import { Server, WebSocket } from "ws";
import { Server as HttpServer } from "http";

const rooms = new Map<string, Set<WebSocket>>();

export function setupWebSocket(server: HttpServer) {
    const wss = new Server({ server, path: "/ws" });

    wss.on("connection", (ws) => {
        let boardId: string | null = null;
        ws.on("message", (data) => {
            const msg = JSON.parse(data.toString());
            if (msg.type === "JOIN") {
                boardId = msg.boardId;
                if (!rooms.has(boardId)) rooms.set(boardId, new Set());
                rooms.get(boardId)!.add(ws);
            }
        });
        ws.on("close", () => {
            if (boardId && rooms.has(boardId)) rooms.get(boardId)!.delete(ws);
        });
    });

    const broadcast = (boardId: string, payload: any) => {
        const set = rooms.get(boardId);
        if (!set) return;
        for (const client of set)
            if (client.readyState === 1)
                client.send(JSON.stringify(payload));
    };

    return { broadcast };
}
