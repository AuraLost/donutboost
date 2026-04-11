import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LEN = 64;

export const hashPassword = (plain: string) => {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(plain, salt, KEY_LEN).toString("hex");
  return `${salt}:${hash}`;
};

export const verifyPassword = (plain: string, stored: string) => {
  const [salt, originalHash] = stored.split(":");
  if (!salt || !originalHash) return false;

  const hashBuffer = scryptSync(plain, salt, KEY_LEN);
  const originalBuffer = Buffer.from(originalHash, "hex");
  if (hashBuffer.length !== originalBuffer.length) return false;

  return timingSafeEqual(hashBuffer, originalBuffer);
};
