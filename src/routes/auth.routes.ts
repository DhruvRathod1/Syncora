import { Router, Request, Response } from "express";
import { register, login } from "../services/authService";

const router = Router();

router.get("/login", (req: Request, res: Response) =>
  res.render("login", { query: req.query })
);
router.get("/register", (req: Request, res: Response) =>
  res.render("register", { query: req.query })
);

router.post("/auth/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    await register(email, password);
    // redirect to login with a visible message
    res.redirect(`/login?registered=1&email=${encodeURIComponent(email)}`);
  } catch (err: any) {
    // if duplicate or error, redirect back to register with an error flag
    res.redirect(`/register?error=${encodeURIComponent(err?.name || "unknown")}`);
  }
});

router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const current = (req.session as any)?.user;
  if (current && current.email === email) {
    // already logged in; redirect to boards so user can see they are logged in
    return res.redirect(`/boards`);
  }
  const user = await login(email, password);
  if (user) {
    (req.session as any).user = { id: user.id, email: user.email };
    res.redirect("/boards");
  } else {
    // Redirect back to login with error flag so UI can display message
    res.redirect(`/login?error=1&email=${encodeURIComponent(email)}`);
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login?loggedout=1"));
});

export default router;
