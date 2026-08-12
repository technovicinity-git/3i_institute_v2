import { env } from "#/config/env";
import { app } from "#/app";

async function bootstrap(): Promise<void> {
  app.listen(env.PORT, () => {
    console.log(`🚀 3i Platform API running on port ${env.PORT}`);
    console.log(`📦 Environment: ${env.NODE_ENV}`);
    console.log(`🌐 Health check: http://localhost:${env.PORT}/api/health`);
  });
}

bootstrap().catch((error) => {
  console.error("❌ Failed to start server:", error);
  process.exit(1);
});
