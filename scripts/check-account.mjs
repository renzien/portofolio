import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { verifyPassword } from "../lib/password.mjs";

// Runs only against the disposable database and server passed by integration.mjs.
export async function checkAccountChanges({
  origin,
  database,
  client,
  seed,
  email,
  password,
  root,
}) {
  await database.collection("loginAttempts").deleteMany({});
  const original = await database.collection("admins").findOne({ email });
  let cookie = "";
  async function send(path, body, options = {}) {
    return fetch(origin + path, {
      method: path === "/api/auth/login" ? "POST" : "PUT",
      headers: {
        "Content-Type": "application/json",
        Origin: options.origin || origin,
        Cookie: options.cookie ?? cookie,
      },
      body: JSON.stringify(body),
      redirect: "manual",
    });
  }
  async function login(loginEmail, loginPassword) {
    const response = await send("/api/auth/login", {
      email: loginEmail,
      password: loginPassword,
    });
    assert.equal(response.status, 200, "Login with current credentials failed");
    cookie = response.headers.get("set-cookie").split(";")[0];
    return cookie;
  }
  const change = {
    email,
    currentPassword: password,
    newPassword: "",
    confirmPassword: "",
  };
  assert.equal((await send("/api/admin/account", change)).status, 401);
  const firstCookie = await login(email, password);
  const secondCookie = await login(email, password);
  const oldSession = await database
    .collection("sessions")
    .findOne({ tokenHash: createHash("sha256").update(firstCookie.split("=")[1]).digest("hex") });
  assert.equal(
    (
      await send("/api/admin/account", change, {
        origin: "https://attacker.example",
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await send("/api/admin/account", {
        ...change,
        currentPassword: "wrong",
        email: "new@example.test",
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await send("/api/admin/account", {
        ...change,
        newPassword: "short",
        confirmPassword: "short",
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await send("/api/admin/account", {
        ...change,
        newPassword: "valid-new-password",
        confirmPassword: "different",
      })
    ).status,
    400,
  );
  assert.equal(
    (await send("/api/admin/account", { ...change, adminId: "another-admin" }))
      .status,
    400,
  );
  assert.equal((await send("/api/admin/account", change)).status, 400);
  const other = await database
    .collection("admins")
    .insertOne({
      email: "used@example.test",
      passwordHash: original.passwordHash,
    });
  assert.equal(
    (
      await send("/api/admin/account", {
        ...change,
        email: "used@example.test",
      })
    ).status,
    409,
  );
  await database.collection("admins").deleteOne({ _id: other.insertedId });
  const newEmail = "changed-admin@example.test";
  const changed = await send("/api/admin/account", {
    ...change,
    email: newEmail,
  });
  assert.equal(changed.status, 200);
  assert.match(changed.headers.get("set-cookie"), /alif_admin_session=;/);
  const afterEmail = await database
    .collection("admins")
    .findOne({ _id: original._id });
  assert.equal(afterEmail.email, newEmail);
  assert.equal(afterEmail.passwordHash, original.passwordHash);
  assert.equal(afterEmail.credentialVersion, 1);
  for (const oldCookie of [firstCookie, secondCookie]) {
    assert.equal(
      (await send("/api/admin/account", change, { cookie: oldCookie })).status,
      401,
    );
  }
  // A session created concurrently with a password change must still be rejected by its version.
  await database
    .collection("sessions")
    .insertOne({ ...oldSession, expiresAt: new Date(Date.now() + 60000) });
  assert.equal(
    (await send("/api/admin/account", change, { cookie: firstCookie })).status,
    401,
  );
  await database.collection("sessions").deleteOne({ _id: oldSession._id });
  assert.equal(
    (await send("/api/auth/login", { email, password })).status,
    401,
  );
  await seed(password, { shouldFail: true });
  assert.equal(
    await database.collection("admins").countDocuments(),
    1,
    "Seed recreated the old login",
  );
  await login(newEmail, password);
  const newPassword = "new-disposable-password-2026";
  assert.equal(
    (
      await send("/api/admin/account", {
        ...change,
        email: newEmail,
        newPassword,
        confirmPassword: newPassword,
      })
    ).status,
    200,
  );
  assert.equal(
    (await send("/api/auth/login", { email: newEmail, password })).status,
    401,
  );
  await login(newEmail, newPassword);
  const afterPassword = await database
    .collection("admins")
    .findOne({ _id: original._id });
  assert.equal(
    await verifyPassword(newPassword, afterPassword.passwordHash),
    true,
  );
  assert.notEqual(afterPassword.passwordHash, newPassword);
  // Change both fields together and restore the public test fixture for subsequent preview.
  assert.equal(
    (
      await send("/api/admin/account", {
        email,
        currentPassword: newPassword,
        newPassword: password,
        confirmPassword: password,
      })
    ).status,
    200,
  );
  await database.collection("loginAttempts").deleteMany({});
  await login(email, password);
  for (let attempt = 0; attempt < 11; attempt++) {
    const response = await send("/api/admin/account", {
      ...change,
      currentPassword: "wrong",
    });
    assert.equal(response.status, attempt < 10 ? 403 : 429);
  }
  await database.collection("loginAttempts").deleteMany({});
  await seed(newPassword, { reset: true });
  assert.equal((await send("/api/admin/account", change)).status, 401);
  assert.equal(
    (await send("/api/auth/login", { email, password })).status,
    401,
  );
  await login(email, newPassword);
  await seed(password, { reset: true });
  await login(email, password);
  assert.equal(await database.collection("admins").countDocuments(), 1);
  assert.equal(
    String((await database.collection("admins").findOne({ email }))._id),
    String(original._id),
  );

  let bootstrap;
  try {
    bootstrap = JSON.parse(
      await readFile(resolve(root, ".admin-bootstrap.json"), "utf8"),
    );
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  if (bootstrap) {
    await seed("", { db: "bootstrap_integration", email: "" });
    await seed("", { db: "bootstrap_integration", email: "" });
    const presetDb = client.db("bootstrap_integration");
    assert.equal(await presetDb.collection("admins").countDocuments(), 1);
    const preset = await presetDb
      .collection("admins")
      .findOne({ email: bootstrap.email });
    assert.equal(preset.passwordHash, bootstrap.passwordHash);
    await seed("", {
      db: "bootstrap_integration",
      email: "",
      reset: true,
      shouldFail: true,
    });
  }
  await database.collection("loginAttempts").deleteMany({});
  console.log(
    "PASS: account email/password changes, current-password verification, validation, duplicate email, session revocation/version, throttling, seed after rename, manual reset and private bootstrap.",
  );
}
