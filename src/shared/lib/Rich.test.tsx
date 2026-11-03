import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Rich } from "./Rich";

describe("Rich", () => {
  it("renders <em> markers as styled elements", () => {
    const { container } = render(
      <p>
        <Rich text="I am a <em>dedicated developer</em> today" emClassName="hl" />
      </p>,
    );
    expect(container.querySelector("span.hl")).toHaveTextContent("dedicated developer");
    expect(container).toHaveTextContent("I am a dedicated developer today");
  });

  it("never turns other markup in copy into elements", () => {
    const { container } = render(
      <p>
        <Rich text="Uses a script in the <head> tag and <script>x</script>" />
      </p>,
    );
    expect(container.querySelector("head, script")).toBeNull();
    expect(screen.getByText(/<head> tag/)).toBeInTheDocument();
  });
});
