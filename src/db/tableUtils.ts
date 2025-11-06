export const pk = (type: string, id: string) => `${type.toUpperCase()}#${id}`;
export const sk = (sub: string) => sub.toUpperCase();

export const emailPk = (email: string) => `EMAIL#${email}`;
export const memberKey = (boardId: string, userId: string) =>
  `BOARD#${boardId}#MEMBER#${userId}`;
