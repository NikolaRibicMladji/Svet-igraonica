import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders home page content", () => {
  render(<App />);

  const heading = screen.getByText(/najbolja mesta za/i);
  expect(heading).toBeInTheDocument();
});
