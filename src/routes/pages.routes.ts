import { Router } from "express";
import { authRequired } from "../middleware/authRequired";
import { createBoard, getBoardsByOwner, createTask, getTasksForBoard, getBoardMeta } from "../services/boardService";
import { getMembers, getInvitesForUser, acceptInvite, rejectInvite } from "../services/memberService";

const router = Router();

router.get("/", (_, res) => res.redirect("/boards"));

router.get("/boards", authRequired, async (req, res) => {
  const user = (req.session as any)?.user;
  const boards = await getBoardsByOwner(user.id);
  const invites = await getInvitesForUser(user.id);
  res.render("boards", { user, boards, invites });
});

router.post("/boards/create", authRequired, async (req, res) => {
  const user = (req.session as any)?.user;
  const { title } = req.body;
  await createBoard(title, user.id);
  res.redirect("/boards");
});

router.get("/board/:id", authRequired, async (req, res) => {
  const { id } = req.params;
  const [tasks, meta, members] = await Promise.all([
    getTasksForBoard(id),
    getBoardMeta(id),
    getMembers(id),
  ]);
  res.render("board", { board: { id, title: meta?.title || "Board" }, tasks, members });
});

router.post("/board/:id/task", authRequired, async (req, res) => {
  const user = (req.session as any)?.user;
  const { id } = req.params;
  const { text } = req.body;
  await createTask(id, text, user.id);
  res.redirect(`/board/${id}`);
});

router.post("/invites/:boardId/accept", authRequired, async (req, res) => {
  const user = (req.session as any)?.user;
  const { boardId } = req.params;
  await acceptInvite(user.id, boardId);
  res.redirect("/boards?accepted=1");
});

router.post("/invites/:boardId/reject", authRequired, async (req, res) => {
  const user = (req.session as any)?.user;
  const { boardId } = req.params;
  await rejectInvite(user.id, boardId);
  res.redirect("/boards?rejected=1");
});

export default router;
