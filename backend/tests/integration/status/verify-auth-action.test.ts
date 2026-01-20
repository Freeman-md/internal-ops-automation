import { describe, expect, it } from "vitest";
import { verifyAuthAction } from "@/adapters/status/verifications/verify-auth-action";
import { VerificationError } from "@/domain/errors/verification.error";

describe("verifyAuthAction", () => {
  it("does not throw when the timestamp changes", () => {
    expect(() => verifyAuthAction("before", "after", [])).not.toThrow();
  });

  it("throws when the timestamp does not change", () => {
    expect(() => verifyAuthAction("same", "same", [])).toThrowError(
      VerificationError
    );
  });
});
