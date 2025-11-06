import { createBoard as persistBoard } from "../../services/boardService";

export async function createBoard({ title }: any, context: any) {
  const ownerId = context.user.id;
  const board = await persistBoard(title, ownerId);
  return board;
}
