import { createTask as persistTask } from "../../services/boardService";

export async function createTask({ boardId, text }: any, context: any) {
  const createdBy = context.user.id;
  const task = await persistTask(boardId, text, createdBy);
  context.ws.broadcast(boardId, { type: "TASK_CREATED", task });
  return task;
}
