import { VerificationError } from "@/domain/errors/verification.error";

export function verifyAuthAction(before: string, after: string, summary: string[]) {
  if (before === after) {
    throw new VerificationError("Authenticated action timestamp did not change", {
      before,
      after,
    });
  }
}