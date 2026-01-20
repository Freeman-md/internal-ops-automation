import { describe, expect, it, vi } from "vitest";

vi.mock("@/infra/auth/authenticate", () => ({
  authenticate: vi.fn(),
}));

import { authenticate } from "@/infra/auth/authenticate";
import { withAuth } from "@/infra/auth/with-auth";

describe("withAuth", () => {
  it("authenticates before running the next step", async () => {
    const calls: string[] = [];
    vi.mocked(authenticate).mockImplementation(async () => {
      calls.push("auth");
    });
    const next = vi.fn().mockImplementation(async () => {
      calls.push("next");
    });

    await withAuth({} as any, {} as any, next);

    expect(calls).toEqual(["auth", "next"]);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
