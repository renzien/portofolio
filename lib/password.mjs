import { scrypt, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
const derive = promisify(scrypt);
export async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = await derive(password, salt, 64);
  return `scrypt:${salt}:${hash.toString("hex")}`;
}
export async function verifyPassword(password, encoded) {
  try {
    const [algorithm, salt, hex] = encoded.split(":");
    if (
      algorithm !== "scrypt" ||
      !/^[a-f0-9]{32}$/.test(salt) ||
      !/^[a-f0-9]{128}$/.test(hex)
    )
      return false;
    const expected = Buffer.from(hex, "hex");
    const actual = await derive(password, salt, 64);
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}
