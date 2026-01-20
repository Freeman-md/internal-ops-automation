import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/infra/browser/create-page", () => ({
  createPage: vi.fn(),
}));

vi.mock("@/infra/auth/authenticate", () => ({
  authenticate: vi.fn(),
}));

vi.mock("fs", () => ({
  default: {
    existsSync: vi.fn(),
  },
}));

import { authenticate } from "@/infra/auth/authenticate";
import { createPage } from "@/infra/browser/create-page";
import { executeWorkflow } from "@/infra/execute-workflow";
import fs from "fs";

describe("executeWorkflow", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("runs the workflow and returns success", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    const close = vi.fn().mockResolvedValue(undefined);
    vi.mocked(createPage).mockResolvedValue({
      browser: { close } as any,
      context: {} as any,
      page: {} as any,
    });

    const run = vi.fn().mockResolvedValue("ok");
    const result = await executeWorkflow({ name: "demo", run });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("ok");
    }
    expect(createPage).toHaveBeenCalledWith(
      expect.objectContaining({
        headless: true,
        storageState: undefined,
      })
    );
    expect(run).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledTimes(1);
  });

  it("authenticates when requiresAuth is true", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    vi.mocked(createPage).mockResolvedValue({
      browser: { close: vi.fn().mockResolvedValue(undefined) } as any,
      context: {} as any,
      page: {} as any,
    });

    const run = vi.fn().mockResolvedValue("ok");
    await executeWorkflow({ name: "auth", requiresAuth: true, run });

    expect(vi.mocked(authenticate)).toHaveBeenCalledTimes(1);
  });

  it("retries the workflow and closes the browser each attempt", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    const close1 = vi.fn().mockResolvedValue(undefined);
    const close2 = vi.fn().mockResolvedValue(undefined);
    vi.mocked(createPage)
      .mockResolvedValueOnce({
        browser: { close: close1 } as any,
        context: {} as any,
        page: {} as any,
      })
      .mockResolvedValueOnce({
        browser: { close: close2 } as any,
        context: {} as any,
        page: {} as any,
      });

    const run = vi
      .fn()
      .mockRejectedValueOnce(new Error("fail"))
      .mockResolvedValueOnce("ok");

    const result = await executeWorkflow(
      { name: "retry", run },
      { retries: 2 }
    );

    expect(result.success).toBe(true);
    expect(run).toHaveBeenCalledTimes(2);
    expect(close1).toHaveBeenCalledTimes(1);
    expect(close2).toHaveBeenCalledTimes(1);
  });

  it("normalizes typed errors when retries are exhausted", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    vi.mocked(createPage).mockResolvedValue({
      browser: { close: vi.fn().mockResolvedValue(undefined) } as any,
      context: {} as any,
      page: {} as any,
    });

    const error = Object.assign(new Error("bad"), {
      type: "VERIFICATION",
      meta: { id: "X-1" },
    });
    const run = vi.fn().mockRejectedValue(error);

    const result = await executeWorkflow({ name: "fail", run }, { retries: 1 });

    if (result.success) {
      throw new Error("Expected workflow failure");
    }

    const failure = result as Extract<typeof result, { success: false }>;
    expect(failure.error).toEqual({
      type: "VERIFICATION",
      message: "bad",
      meta: { id: "X-1" },
    });
  });
});
