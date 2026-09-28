import { test } from "node:test";
import assert from "node:assert/strict";
import {
  projectSchema,
  settingsSchema,
  safeUrl,
  imageUrl,
  accountSchema,
} from "../lib/validation.ts";
import { defaultSettings, sampleProjects } from "../lib/defaults.ts";
import { hashPassword, verifyPassword } from "../lib/password.mjs";
test("Account changes validate confirmation, password length, email and identity injection", () => {
  const value = {
    email: " Alif@Example.test ",
    currentPassword: "current-password",
    newPassword: "",
    confirmPassword: "",
  };
  assert.equal(accountSchema.parse(value).email, "alif@example.test");
  for (const invalid of [
    { currentPassword: "" },
    { email: "invalid" },
    { newPassword: "too-short", confirmPassword: "too-short" },
    { newPassword: "a-new-valid-password", confirmPassword: "mismatch" },
    { confirmPassword: "unexpected" },
    { adminId: "another-admin" },
    { credentialVersion: 0 },
  ])
    assert.equal(
      accountSchema.safeParse({ ...value, ...invalid }).success,
      false,
    );
  assert.equal(
    accountSchema.safeParse({
      ...value,
      newPassword: "a-new-valid-password",
      confirmPassword: "a-new-valid-password",
    }).success,
    true,
  );
});
test("Reject script, credential-bearing and non-HTTPS action URLs", () => {
  for (const value of [
    "javascript:alert(1)",
    "data:text/html,bad",
    "//evil.test",
    "https://user:pass@host.test",
    "http://example.com",
  ])
    assert.equal(safeUrl.safeParse(value).success, false, value);
  assert.equal(
    safeUrl.safeParse("https://github.com/alif/app/releases").success,
    true,
  );
  assert.equal(safeUrl.safeParse("").success, true);
});
test("Allow uploaded images without opening arbitrary local paths", () => {
  assert.equal(
    imageUrl.safeParse("/api/media/abcdef0123456789abcdef01").success,
    true,
  );
  for (const value of [
    "/admin",
    "//evil.test/image.png",
    "/images/../../admin",
    "data:image/svg+xml,<svg/>",
  ])
    assert.equal(imageUrl.safeParse(value).success, false);
});
test("Project schema rejects privilege/identity injection and malformed content", () => {
  const { id: _, ...project } = sampleProjects[0];
  assert.equal(projectSchema.safeParse(project).success, true);
  assert.equal(
    projectSchema.safeParse({ ...project, id: "overwrite" }).success,
    false,
  );
  assert.equal(
    projectSchema.safeParse({ ...project, published: "true" }).success,
    false,
  );
  assert.equal(
    projectSchema.safeParse({ ...project, order: -1 }).success,
    false,
  );
  assert.equal(
    projectSchema.safeParse({ ...project, category: "other" }).success,
    false,
  );
  assert.equal(settingsSchema.safeParse(defaultSettings).success, true);
});
test("Salted password hashing validates only the correct password", async () => {
  const pass = "a-local-test-password";
  const a = await hashPassword(pass),
    b = await hashPassword(pass);
  assert.notEqual(a, b);
  assert.equal(await verifyPassword(pass, a), true);
  assert.equal(await verifyPassword("incorrect", a), false);
  assert.equal(await verifyPassword(pass, "malformed"), false);
});
