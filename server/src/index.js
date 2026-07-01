import "dotenv/config";
import express from "express";
import session from "express-session";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import productsRouter from "./routes/products.js";
import postsRouter from "./routes/posts.js";
import commentsRouter from "./routes/comments.js";
import adminRouter from "./routes/admin.js";
import authRouter from "./routes/auth.js";
import oauthRouter from "./routes/oauth.js";

const app = express();
const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const isProd = process.env.NODE_ENV === "production";

// 리버스 프록시(HTTPS 종단) 뒤에서 secure 쿠키가 동작하도록
app.set("trust proxy", 1);

// 보안 HTTP 헤더(helmet)
app.use(helmet());

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// 개발 환경에서 Vite 프록시를 쓰면 동일 출처가 되지만,
// 프록시 없이 직접 호출하는 경우를 대비해 CORS(자격증명 포함)도 허용한다.
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  })
);

// 세션 저장소: 가능하면 SQLite(영속) — 서버 재시작에도 로그인 유지.
// connect-sqlite3 설치/빌드가 안 된 환경에서는 메모리 저장소로 폴백한다.
let sessionStore;
try {
  const { default: connectSqlite3 } = await import("connect-sqlite3");
  const SQLiteStore = connectSqlite3(session);
  sessionStore = new SQLiteStore({ db: "sessions.sqlite", dir: "./prisma" });
  console.log("🔐 세션 저장소: SQLite (재시작에도 로그인 유지)");
} catch (e) {
  console.warn(
    "⚠️  connect-sqlite3 사용 불가 → 메모리 세션으로 폴백(서버 재시작 시 로그인 풀림):",
    e.message
  );
  sessionStore = undefined; // 기본 MemoryStore
}

app.use(
  session({
    name: "connect.sid",
    store: sessionStore,
    secret: process.env.SESSION_SECRET || "greentech-dev-secret",
    resave: false,
    saveUninitialized: false,
    rolling: true, // 요청마다 만료시간 갱신(슬라이딩 만료)
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd, // 운영(HTTPS)에서 자동으로 secure 쿠키 사용
      maxAge: 1000 * 60 * 60 * 24, // 1일(마지막 활동 기준)
    },
  })
);

app.use("/api/products", productsRouter);
app.use("/api/posts", postsRouter);
app.use("/api", commentsRouter); // /api/posts/:postId/comments, /api/comments/:id
app.use("/api/admin", adminRouter);
app.use("/api/auth/oauth", oauthRouter);
app.use("/api/auth", authRouter);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

// 알 수 없는 API 경로
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "존재하지 않는 API 경로입니다." });
});

// 공통 에러 핸들러
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "서버 내부 오류가 발생했습니다." });
});

app.listen(PORT, () => {
  console.log(`🌱 GreenTech API server running on http://localhost:${PORT}`);
});
