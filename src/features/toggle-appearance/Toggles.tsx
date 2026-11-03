import { faCircleHalfStroke, faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "~/shared/ui/Icon";
import { useAppearance } from "./AppearanceProvider";

interface ToggleProps {
  id: string;
  className: string;
  ariaLabel: string;
}

// Both icons are rendered; CSS shows the right one from the `html.dark-mode` class set by the
// pre-paint script, so there is no flash and no hydration mismatch.
export function DarkModeToggle({ id, className, ariaLabel }: ToggleProps) {
  const { dark, toggleDark } = useAppearance();
  return (
    <button
      type="button"
      id={id}
      className={className}
      aria-label={ariaLabel}
      aria-pressed={dark}
      onClick={toggleDark}
    >
      <Icon icon={faSun} className="dark:hidden" />
      <Icon icon={faMoon} className="hidden dark:inline-block" />
    </button>
  );
}

export function ContrastToggle({ id, className, ariaLabel }: ToggleProps) {
  const { contrast, toggleContrast } = useAppearance();
  return (
    <button
      type="button"
      id={id}
      className={className}
      aria-label={ariaLabel}
      aria-pressed={contrast}
      onClick={toggleContrast}
    >
      <Icon icon={faCircleHalfStroke} />
    </button>
  );
}
