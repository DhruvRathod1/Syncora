import { addMember as addMemberSvc, inviteMember, acceptInvite as acceptInviteSvc, rejectInvite as rejectInviteSvc } from "../../services/memberService";
import { getUserByEmail } from "../../services/authService";
import { getBoardMeta } from "../../services/boardService";

export async function addMember({ boardId, email, role }: any, context: any) {
    if (!context.user) throw new Error("Unauthorized");
    // Ensure inviter is owner/editor (basic check can be added later)
    const user = await getUserByEmail(email);
    if (!user) throw new Error("User not found");
    const meta = await getBoardMeta(boardId);
    await inviteMember(boardId, meta?.title || "Board", context.user.id, user.id, user.email, role || "VIEWER");
    return { userId: user.id, role: role || "VIEWER" };
}

export async function acceptInvite({ boardId }: any, context: any) {
    if (!context.user) throw new Error("Unauthorized");
    const member = await acceptInviteSvc(context.user.id, boardId);
    context.ws.broadcast(boardId, { type: "MEMBER_ADDED", member });
    return true;
}

export async function rejectInvite({ boardId }: any, context: any) {
    if (!context.user) throw new Error("Unauthorized");
    await rejectInviteSvc(context.user.id, boardId);
    return true;
}
