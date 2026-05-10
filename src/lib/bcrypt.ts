import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

// Hash password sebelum disimpan ke database
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

// Verifikasi password saat login
export async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}
