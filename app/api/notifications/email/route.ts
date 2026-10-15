import { env } from "cloudflare:workers";
import { handleEmailNotification, type EmailEnv } from "../../../../worker/email-notifications";

function emailEnv(): EmailEnv {
  return env as unknown as EmailEnv;
}

export async function GET(request: Request) {
  return await handleEmailNotification(request, emailEnv());
}

export async function POST(request: Request) {
  return await handleEmailNotification(request, emailEnv());
}
