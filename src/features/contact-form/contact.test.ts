import { describe, expect, it, vi } from "vitest";
import { counterTier, validateContact } from "./validate";
import { submitWeb3Forms } from "./submitWeb3Forms";

const valid = { name: "Ana", email: "ana@example.com", message: "Hello", honeypot: "" };

describe("validateContact", () => {
  it("accepts a complete, trimmed submission", () => {
    expect(validateContact({ ...valid, name: "  Ana  " })).toEqual({
      kind: "ok",
      value: { name: "Ana", email: "ana@example.com", message: "Hello" },
    });
  });

  it.each(["name", "email", "message"] as const)("rejects an empty %s", (field) => {
    expect(validateContact({ ...valid, [field]: "   " })).toEqual({ kind: "invalid", error: "emptyFields" });
  });

  it.each(["ana", "ana@", "ana@example", "a b@example.com", "@example.com"])("rejects email %s", (email) => {
    expect(validateContact({ ...valid, email })).toEqual({ kind: "invalid", error: "invalidEmail" });
  });

  it("flags a filled honeypot as spam before anything else", () => {
    expect(validateContact({ name: "", email: "", message: "", honeypot: "x" })).toEqual({ kind: "spam" });
  });
});

describe("counterTier", () => {
  it.each([
    [0, "none"],
    [999, "none"],
    [1000, "1000"],
    [1499, "1000"],
    [1500, "1500"],
    [1800, "1800"],
    [2000, "2000"],
  ] as const)("%i characters -> %s", (length, tier) => {
    expect(counterTier(length)).toBe(tier);
  });
});

describe("submitWeb3Forms", () => {
  const value = { name: "Ana", email: "ana@example.com", message: "Hello" };
  const respond = (body: unknown) =>
    vi.fn().mockResolvedValue({ json: async () => body }) as unknown as typeof fetch;

  it("posts the expected JSON payload to the provider", async () => {
    const fetchMock = respond({ success: true });
    expect(await submitWeb3Forms(value, fetchMock)).toBe("success");
    const [url, init] = (fetchMock as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.web3forms.com/submit");
    expect(init.method).toBe("POST");
    const payload = JSON.parse(init.body as string) as Record<string, string>;
    expect(payload).toMatchObject({
      from_name: "Contato - Portfolio",
      subject: "Nova mensagem de Ana",
      name: "Ana",
      email: "ana@example.com",
      message: "Hello",
    });
    expect(payload.access_key).toBeTruthy();
  });

  it("reports a provider-side failure", async () => {
    expect(await submitWeb3Forms(value, respond({ success: false }))).toBe("failed");
  });

  it("reports a network or parse error", async () => {
    const rejecting = vi.fn().mockRejectedValue(new Error("offline")) as unknown as typeof fetch;
    expect(await submitWeb3Forms(value, rejecting)).toBe("error");
  });
});
