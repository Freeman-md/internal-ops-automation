import { VerificationError } from "@/domain/errors/verification.error";

export function verifySessionHealth(
  status: { valid: boolean },
  user: { userId: string; email: string },
  summary: string[]
) {
  if (!status.valid) {
    throw new VerificationError("Session marked invalid");
  }

  if (!user.userId || !user.email) {
    throw new VerificationError("Authenticated user info missing", user);
  }

  if (!summary.some(s => /session.*valid/i.test(s))) {
    throw new VerificationError("Verification summary missing session validation");
  }
}