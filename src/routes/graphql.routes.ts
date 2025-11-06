import { register, login } from "../services/authService";

export async function registerResolver({ email, password }: any) {
  return register(email, password);
}

export async function loginResolver({ email, password }: any, context: any) {
  const user = await login(email, password);
  if (user) {
    context.req.session.user = { id: user.id, email: user.email };
    return true;
  }
  return false;
}
