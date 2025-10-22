import { render, screen } from "@testing-library/react";
import { ToolCard } from "../ToolCard";

describe("ToolCard", () => {
  it("renders title and link", () => {
    render(
      <ToolCard
        title="JSON Formatter"
        desc="Pretty-print"
        href="/tools/json-formatter"
      />
    );
    expect(screen.getByText(/json formatter/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open tool/i })).toHaveAttribute(
      "href",
      "/tools/json-formatter"
    );
  });
});
