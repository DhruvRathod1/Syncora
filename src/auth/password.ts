import bcrypt from "bcrypt";

export const hashPassword = async (pwd: string) => bcrypt.hash(pwd, 10);
export const comparePassword = async (pwd: string, hash: string) => bcrypt.compare(pwd, hash);
