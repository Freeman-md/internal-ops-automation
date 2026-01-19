import { describe, expect, it, vi } from "vitest";
import { ActionError } from "@/domain/errors/action.error";

vi.mock("@/adapters/status/selectors/read-auth-action", () => ({
  readAuthenticatedActionValue: vi.fn(),
}));

import { performAuthenticatedAction } from "@/adapters/status/actions/perform-auth-action";
import { readAuthenticatedActionValue } from "@/adapters/status/selectors/read-auth-action";

describe("performAuthenticatedAction", () => {
  it("clicks the action button and returns the read value", async () => {
    vi.mocked(readAuthenticatedActionValue).mockResolvedValueOnce("done");
    const click = vi.fn().mockResolvedValue(undefined);
    const getByRole = vi.fn().mockReturnValue({ click });
    const page = { getByRole } as any;

    const result = await performAuthenticatedAction(page);

    expect(getByRole).toHaveBeenCalledWith("button", {
      name: /perform authenticated action/i,
    });
    expect(click).toHaveBeenCalled();
    expect(result).toBe("done");
  });

  it("throws ActionError when the action fails", async () => {
    const click = vi.fn().mockRejectedValue(new Error("fail"));
    const getByRole = vi.fn().mockReturnValue({ click });
    const page = { getByRole } as any;

    await expect(performAuthenticatedAction(page)).rejects.toBeInstanceOf(ActionError);
  });
});
