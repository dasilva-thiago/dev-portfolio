export interface ContactInput {
  name: string;
  email: string;
  message: string;
  honeypot: string;
}

export type ContactError = "emptyFields" | "invalidEmail";

export type ContactValidation =
  | { kind: "spam" }
  | { kind: "invalid"; error: ContactError }
  | { kind: "ok"; value: { name: string; email: string; message: string } };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContact(input: ContactInput): ContactValidation {
  if (input.honeypot !== "") return { kind: "spam" };

  const name = input.name.trim();
  const email = input.email.trim();
  const message = input.message.trim();

  if (!name || !email || !message) return { kind: "invalid", error: "emptyFields" };
  if (!EMAIL.test(email)) return { kind: "invalid", error: "invalidEmail" };
  return { kind: "ok", value: { name, email, message } };
}

export function counterTier(length: number): "none" | "1000" | "1500" | "1800" | "2000" {
  if (length >= 2000) return "2000";
  if (length >= 1800) return "1800";
  if (length >= 1500) return "1500";
  if (length >= 1000) return "1000";
  return "none";
}
