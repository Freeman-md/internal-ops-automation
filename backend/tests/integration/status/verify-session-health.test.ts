import { describe, expect, it } from "vitest";
import { verifySessionHealth } from "@/adapters/status/verifications/verify-session-health";
import { VerificationError } from "@/domain/errors/verification.error";

describe("verifySessionHealth", () => {
  it("does not throw when status, user, and summary are valid", () => {
    expect(() =>
      verifySessionHealth(
        { valid: true },
        { userId: "u-1", email: "user@example.com" },
        ["Session is valid"]
      )
    ).not.toThrow();
  });

  it("throws when the session is invalid", () => {
    expect(() =>
      verifySessionHealth(
        { valid: false },
        { userId: "u-1", email: "user@example.com" },
        ["Session is valid"]
      )
    ).toThrowError(VerificationError);
  });

  it("throws when user info is missing", () => {
    expect(() =>
      verifySessionHealth({ valid: true }, { userId: "", email: "" }, [
        "Session is valid",
      ])
    ).toThrowError(VerificationError);
  });

  it("throws when summary is missing session validation", () => {
    expect(() =>
      verifySessionHealth(
        { valid: true },
        { userId: "u-1", email: "user@example.com" },
        ["Other checks ok"]
      )
    ).toThrowError(VerificationError);
  });
});
