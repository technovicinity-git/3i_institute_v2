import { createServer } from "node:http";
import { env } from "#/config/env";
import { app } from "#/app";
import { initializeSocket } from "#/modules/chat/socket";

async function bootstrap(): Promise<void> {
  const httpServer = createServer(app);

  // Initialize Socket.IO
  initializeSocket(httpServer);

  httpServer.listen(env.PORT, () => {
    console.log(`🚀 3i Platform API running on port ${env.PORT}`);
    console.log(`📦 Environment: ${env.NODE_ENV}`);
    console.log(`🌐 Health check: http://localhost:${env.PORT}/api/health`);
    console.log(`🔌 WebSocket: ws://localhost:${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("❌ Failed to start server:", error);
  process.exit(1);
});
