export type TaskStatus = "TODO" | "DOING" | "DONE";
export interface Task {
  id: string;
  boardId: string;
  text: string;
  status: TaskStatus;
  createdBy: string;
}
