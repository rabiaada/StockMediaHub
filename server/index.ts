import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import session from "express-session";

const app = express();
const port = 5000; // Portu sabit olarak tanımlayın

app.use(session({
  secret: process.env.SESSION_SECRET || "gizliAnahtar", // Güçlü bir secret kullan
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // HTTPS kullanıyorsan true yap
}));


// Middleware'ler
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Loglama middleware'i
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Hata yönetimi middleware'i
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({ message });
  log(`Error: ${status} - ${message}`);
  if (status === 500) {
    console.error(err); // Detaylı hata logu
  }
});

// Sunucuyu başlatma işlemi
(async () => {
  try {
    const server = await registerRoutes(app);

    // Geliştirme ortamında Vite'ı kur
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app); // Production'da statik dosyaları sun
    }

    // Sunucuyu belirtilen portta başlat
    server.listen(port, "0.0.0.0", () => {
      log(`Server is running on http://0.0.0.0:${port}`);
    });
  } catch (error) {
    console.error("Server failed to start:", error);
    process.exit(1); // Hata durumunda uygulamayı sonlandır
  }
})();