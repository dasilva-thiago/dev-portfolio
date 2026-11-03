import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import type { SVGProps } from "react";

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
  icon: IconDefinition;
}

// Renders Font Awesome icon data as an inline <svg> with the same markup the library produces, so the
// stylesheet (`svg-inline--fa`) sizes it. Only the imported icons end up in the bundle.
export function Icon({ icon, className = "", ...rest }: IconProps) {
  const [width, height, , , path] = icon.icon;
  return (
    <svg
      data-prefix={icon.prefix}
      data-icon={icon.iconName}
      className={`svg-inline--fa fa-${icon.iconName} ${className}`.trim()}
      role="img"
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
      {...rest}
    >
      <path fill="currentColor" d={Array.isArray(path) ? path.join(" ") : path} />
    </svg>
  );
}
