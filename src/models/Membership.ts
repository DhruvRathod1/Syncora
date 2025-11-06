export type Role = "OWNER" | "EDITOR" | "VIEWER";
export interface Membership {
  boardId: string;
  userId: string;
  role: Role;
}
