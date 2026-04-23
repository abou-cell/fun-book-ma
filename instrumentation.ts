import { captureMessage } from "@/lib/observability/monitoring";

export async function register() {
  captureMessage("Instrumentation initialized", { runtime: process.env.NEXT_RUNTIME ?? "nodejs" });
}
