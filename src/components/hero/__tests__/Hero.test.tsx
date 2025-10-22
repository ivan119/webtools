import { render, screen } from "@testing-library/react";
import { Hero } from "../../hero/Hero";

describe("Hero", () => {
  it("renders title and optional subtitle", () => {
    render(<Hero title="Cinematic Works" subtitle="Visual narratives" />);
    expect(screen.getByRole("region", { name: /hero/i })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /cinematic works/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/visual narratives/i)).toBeInTheDocument();
  });
});
