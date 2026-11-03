import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { useState, type FormEvent } from "react";
import { useT } from "~/shared/i18n/useT";
import { Icon } from "~/shared/ui/Icon";
import { MESSAGE_MAX_LENGTH } from "./config";
import { submitWeb3Forms } from "./submitWeb3Forms";
import { counterTier, validateContact, type ContactError } from "./validate";

type Feedback = { type: "success" | "error"; key: ContactError | "success" | "failed" | "error" };
type Status = "idle" | "submitting";

const LABEL = "mb-0.5 text-[12px] font-semibold uppercase tracking-[0.5px] text-muted";

const FIELD =
  "mb-[18px] w-full rounded-xl border-[1.5px] border-line-strong bg-surface px-[18px] py-3.5 font-[family-name:var(--font-body)] text-[15px] text-text outline-none " +
  "transition-[border-color,box-shadow] duration-200 focus:border-link focus:shadow-[0_0_0_3px_var(--shadow-link-focus)]";

const COUNTER: Record<ReturnType<typeof counterTier>, string> = {
  none: "text-muted",
  "1000": "font-normal text-(color:--char-counter-1000)",
  "1500": "font-normal text-(color:--char-counter-1500)",
  "1800": "font-medium text-(color:--char-counter-1800)",
  "2000": "font-semibold text-(color:--feedback-error-text)",
};

const FEEDBACK: Record<Feedback["type"], string> = {
  success:
    "border-l-(color:--feedback-success-border) bg-(--feedback-success-bg) text-(color:--feedback-success-text)",
  error: "border-l-(color:--feedback-error-border) bg-(--feedback-error-bg) text-(color:--feedback-error-text)",
};

export function ContactForm() {
  const { t } = useT();
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const tier = counterTier(message.length);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const result = validateContact({
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      message,
      honeypot: String(data.get("_honey") ?? ""),
    });

    if (result.kind === "spam") {
      // Silent success so bots get no signal.
      setFeedback({ type: "success", key: "success" });
      form.reset();
      setMessage("");
      return;
    }
    if (result.kind === "invalid") {
      setFeedback({ type: "error", key: result.error });
      return;
    }

    setStatus("submitting");
    const outcome = await submitWeb3Forms(result.value);
    setStatus("idle");
    if (outcome === "success") {
      setFeedback({ type: "success", key: "success" });
      form.reset();
      setMessage("");
    } else {
      setFeedback({ type: "error", key: outcome });
    }
  }

  return (
    <form id="contact-form" noValidate onSubmit={onSubmit} className="flex flex-col gap-1.5">
      <input
        type="text"
        name="_honey"
        className="absolute -left-[9999px] size-px overflow-hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <label htmlFor="name" className={LABEL}>
        {t("contact.form.name")}
      </label>
      <input
        type="text"
        id="name"
        name="name"
        required
        maxLength={100}
        autoComplete="name"
        placeholder={t("contact.form.namePlaceholder")}
        className={FIELD}
      />

      <label htmlFor="email" className={LABEL}>
        {t("contact.form.email")}
      </label>
      <input
        type="email"
        id="email"
        name="email"
        required
        maxLength={100}
        autoComplete="email"
        placeholder={t("contact.form.emailPlaceholder")}
        className={FIELD}
      />

      <label htmlFor="message" className={LABEL}>
        {t("contact.form.message")}
      </label>
      <textarea
        id="message"
        name="message"
        cols={30}
        rows={8}
        required
        maxLength={MESSAGE_MAX_LENGTH}
        placeholder={t("contact.form.messagePlaceholder")}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        className={`${FIELD} resize-none`}
      />
      <span
        data-tier={tier}
        className={`char-counter -mt-3.5 mb-[18px] block text-right text-[12px] transition-colors duration-200 ${COUNTER[tier]}`}
      >
        {message.length} / {MESSAGE_MAX_LENGTH}
      </span>

      <button
        type="submit"
        disabled={status === "submitting"}
        className={
          "flex h-[52px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-fill font-[family-name:var(--font-body)] text-[15px] font-semibold tracking-[0.3px] text-on-fill " +
          "transition-all duration-200 enabled:hover:-translate-y-px enabled:hover:shadow-[0_4px_12px_var(--shadow-link-btn)] enabled:hover:brightness-90 " +
          "disabled:cursor-not-allowed disabled:opacity-65"
        }
      >
        {status === "submitting" ? (
          <>
            <span
              className="inline-block size-3.5 shrink-0 animate-spin-fast rounded-full border-2 border-on-fill/30 border-t-on-fill align-middle"
              aria-hidden="true"
            />{" "}
            {t("contact.form.sending")}
          </>
        ) : (
          <>
            <Icon icon={faPaperPlane} />
            <span>{t("contact.form.button")}</span>
          </>
        )}
      </button>

      <div className="contents" aria-live="polite">
        {feedback ? (
          <p
            id="form-feedback"
            className={`${feedback.type} mt-1 rounded-lg border-l-[3px] border-l-transparent px-3.5 py-2.5 text-[13px] font-semibold leading-[1.5] ${FEEDBACK[feedback.type]}`}
          >
            {t(`contact.feedback.${feedback.key}`)}
          </p>
        ) : null}
      </div>
    </form>
  );
}
