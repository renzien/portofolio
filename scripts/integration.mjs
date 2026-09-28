// Exercises a production Next.js build against a disposable, real local MongoDB.
// It never connects to MONGODB_URI from the caller's environment.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { mkdir, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient } from "mongodb";
import { checkAccountChanges } from "./check-account.mjs";
const root = fileURLToPath(new URL("..", import.meta.url));
const downloadDir =
  process.env.MONGOMS_DOWNLOAD_DIR ||
  resolve(root, "../../work/mongodb-binaries");
await mkdir(downloadDir, { recursive: true });
const mongo = await MongoMemoryServer.create({
  binary: { version: "8.0.17", downloadDir },
  instance: { ip: "127.0.0.1" },
});
const client = new MongoClient(mongo.getUri());
await client.connect();
const database = client.db("portfolio_integration");
const email = "test-admin@example.test",
  password = "local-test-only-password";
async function seed(adminPassword, options = {}) {
  await new Promise((done, fail) => {
    const child = spawn(
      process.execPath,
      ["scripts/seed.mjs", ...(options.reset ? ["--reset-password"] : [])],
      {
        cwd: root,
        windowsHide: true,
        env: {
          ...process.env,
          MONGODB_URI: mongo.getUri(),
          MONGODB_DB: options.db || "portfolio_integration",
          ADMIN_EMAIL: options.email ?? email,
          ADMIN_PASSWORD: adminPassword,
        },
        stdio: "ignore",
      },
    );
    child.on("error", fail);
    child.on("exit", (code) =>
      (options.shouldFail ? code !== 0 : code === 0)
        ? done()
        : fail(new Error(`Unexpected seed exit: ${code}`)),
    );
  });
}
await seed(password);
await seed("idempotent-seed-must-not-change-password");
assert.equal(await database.collection("admins").countDocuments({ email }), 1);
assert.ok(
  (await database.collection("sessions").indexes()).some(
    (index) => index.expireAfterSeconds === 0,
  ),
);
const origin = "http://127.0.0.1:3101";
const server = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    "3101",
  ],
  {
    cwd: root,
    windowsHide: true,
    env: {
      ...process.env,
      MONGODB_URI: mongo.getUri(),
      MONGODB_DB: "portfolio_integration",
      APP_URL: origin,
      NODE_ENV: "production",
    },
    stdio: ["ignore", "pipe", "pipe"],
  },
);
let logs = "";
server.stdout.on("data", (data) => {
  logs += data;
});
server.stderr.on("data", (data) => {
  logs += data;
});
async function stop() {
  server.kill();
  await client.close();
  await mongo.stop();
}
let cookie = "";
async function call(path, method = "GET", body, options = {}) {
  return fetch(origin + path, {
    method,
    headers: {
      ...(method !== "GET"
        ? {
            Origin: options.origin || origin,
            "Content-Type": options.contentType || "application/json",
          }
        : {}),
      ...(options.anonymous ? {} : { Cookie: cookie }),
    },
    body:
      body === undefined
        ? undefined
        : options.raw
          ? body
          : JSON.stringify(body),
    redirect: "manual",
  });
}
try {
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      if ((await fetch(origin)).status === 200) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((done) => setTimeout(done, 500));
  }
  assert.ok(ready, `Server failed to start: ${logs}`);
  assert.equal(
    (await call("/api/admin/projects", "POST", {}, { anonymous: true })).status,
    401,
  );
  assert.equal(
    (
      await call(
        "/api/auth/login",
        "POST",
        { email, password },
        { origin: "https://attacker.example" },
      )
    ).status,
    403,
  );
  assert.equal(
    (await call("/api/auth/login", "POST", { email, password: "wrong" }))
      .status,
    401,
  );
  const login = await call("/api/auth/login", "POST", { email, password });
  assert.equal(login.status, 200);
  const setCookie = login.headers.get("set-cookie");
  assert.match(setCookie, /HttpOnly/i);
  assert.match(setCookie, /Secure/i);
  assert.match(setCookie, /SameSite=strict/i);
  cookie = setCookie.split(";")[0];
  assert.equal((await call("/admin")).status, 200);
  const project = {
    title: "Integration Android",
    category: "android",
    description: "Real MongoDB integration fixture",
    image: "",
    tags: ["Kotlin"],
    year: "2026",
    downloadUrl: "https://example.com/app.apk",
    githubUrl: "https://github.com/example/android",
    playUrl: "",
    published: false,
    order: 0,
    sample: false,
  };
  const create = await call("/api/admin/projects", "POST", project);
  assert.equal(create.status, 200);
  const saved = (await create.json()).project;
  assert.ok(saved.id);
  assert.ok(
    !(await (await call("/")).text()).includes("Integration Android"),
    "Draft leaked publicly",
  );
  assert.equal(
    (
      await call(`/api/admin/projects/${saved.id}`, "PUT", {
        ...project,
        downloadUrl: "javascript:alert(1)",
      })
    ).status,
    400,
  );
  const publish = await call(`/api/admin/projects/${saved.id}`, "PUT", {
    ...project,
    published: true,
  });
  assert.equal(publish.status, 200);
  const publicHtml = await (await call("/")).text();
  assert.ok(publicHtml.includes("Integration Android"));
  assert.ok(publicHtml.includes("https://github.com/example/android"));
  const image = await readFile(resolve(root, "public/images/valley.webp"));
  const upload = await call("/api/admin/upload", "POST", image, {
    raw: true,
    contentType: "image/webp",
  });
  assert.equal(upload.status, 200);
  const mediaUrl = (await upload.json()).url;
  const media = await call(mediaUrl);
  assert.equal(media.status, 200);
  assert.equal(media.headers.get("content-type"), "image/webp");
  assert.ok((await media.arrayBuffer()).byteLength > 1000);
  assert.equal(
    (
      await call("/api/admin/upload", "POST", Buffer.from("not an image"), {
        raw: true,
        contentType: "image/png",
      })
    ).status,
    400,
  );
  const unity = await call("/api/admin/projects", "POST", {
    ...project,
    title: "Integration Unity",
    category: "unity",
    published: true,
    playUrl: "https://example.com/play",
    image: mediaUrl,
    order: 1,
  });
  assert.equal(unity.status, 200);
  const updatedHtml = await (await call("/")).text();
  assert.ok(updatedHtml.includes("Integration Unity"));
  assert.ok(updatedHtml.includes("https://example.com/play"));
  const profile = {
    name: "Alif Rizki",
    role: "Android & Unity Developer",
    headline: "Dari baris kode,",
    headlineAccent: "jadi pengalaman.",
    intro: "Integration saved introduction",
    aboutTitle: "Tentang saya",
    aboutText: "Profile persisted in MongoDB",
    location: "Indonesia",
    email: "hello@example.test",
    githubUrl: "https://github.com/example",
    linkedinUrl: "https://www.linkedin.com/in/example",
    heroImage: "/images/liquid.webp",
    heroSecondaryImage: "/images/valley.webp",
    contactTitle: "Mari berkarya.",
    skills: ["Kotlin", "Unity"],
    liquidEnabled: true,
  };
  assert.equal((await call("/api/admin/settings", "PUT", profile)).status, 200);
  assert.ok(
    (await (await call("/")).text()).includes("Integration saved introduction"),
  );
  assert.equal(
    (await call(`/api/admin/projects/${saved.id}`, "DELETE")).status,
    200,
  );
  assert.equal(
    await database.collection("projects").countDocuments({ id: saved.id }),
    0,
  );
  assert.equal(
    (await call(`/api/admin/projects/${saved.id}`, "DELETE")).status,
    404,
  );
  const validCookie = cookie;
  assert.equal((await call("/api/auth/logout", "POST")).status, 200);
  cookie = validCookie;
  assert.equal((await call("/api/admin/settings", "PUT", profile)).status, 401);
  const relogin = await call("/api/auth/login", "POST", { email, password });
  cookie = relogin.headers.get("set-cookie").split(";")[0];
  const token = cookie.split("=")[1];
  await database
    .collection("sessions")
    .updateOne(
      { tokenHash: createHash("sha256").update(token).digest("hex") },
      { $set: { expiresAt: new Date(0) } },
    );
  assert.equal((await call("/api/admin/settings", "PUT", profile)).status, 401);
  let throttled = false;
  for (let i = 0; i < 11; i++) {
    const res = await call("/api/auth/login", "POST", {
      email,
      password: "wrong",
    });
    if (res.status === 429) {
      throttled = true;
      break;
    }
  }
  assert.ok(throttled, "Login throttling failed");
  await checkAccountChanges({
    origin,
    database,
    client,
    seed,
    email,
    password,
    root,
  });
  console.log(
    "PASS: admin seed/idempotence/indexes, authentication, CSRF, cookies, CRUD, drafts, publish, links, image upload/read, profile persistence, logout, expiry and rate limit (real MongoDB).",
  );
  if (process.argv.includes("--preview")) {
    await database.collection("loginAttempts").deleteMany({});
    await database.collection("settings").deleteMany({});
    console.log(
      `TEST PREVIEW ${origin}/admin/login — disposable account ${email} / ${password}`,
    );
    await new Promise((done) => {
      process.on("SIGINT", done);
      process.on("SIGTERM", done);
    });
  }
} catch (error) {
  console.error(error);
  console.error(logs.slice(-3000));
  process.exitCode = 1;
} finally {
  await stop();
}
