import { WEB3FORMS_ACCESS_KEY, WEB3FORMS_URL } from "./config";

export type SubmitResult = "success" | "failed" | "error";

export async function submitWeb3Forms(
  value: { name: string; email: string; message: string },
  fetchImpl: typeof fetch = fetch,
): Promise<SubmitResult> {
  try {
    const response = await fetchImpl(WEB3FORMS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        from_name: "Contato - Portfolio",
        subject: `Nova mensagem de ${value.name}`,
        name: value.name,
        email: value.email,
        message: value.message,
      }),
    });
    const result = (await response.json()) as { success?: boolean };
    return result.success ? "success" : "failed";
  } catch {
    return "error";
  }
}
