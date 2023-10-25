import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import App from "../src/App";
import { describe, it, expect } from "vitest";

describe("App Component works", () => {
  it("data fetching works", async () => {
    render(<App />);
    // screen.debug()
    // await waitFor(() => {
    //   const buttons = screen.getAllByTestId("add-book")
    //   buttons.forEach(async(button) => {
    //     expect(button).toBeInTheDocument()
    //     expect(button).toHaveTextContent(/Añadir a la lista de lectura/i)
    //     expect(button).not.toBeDisabled()
        
    //     // expect(button).toBeDisabled();
    //     await waitFor(() => {
    //       userEvent.click(button)
    //       expect(button).toBeDisabled();
    //     });
    //   })
    // })

    const buttons = await screen.findAllByTestId("add-book")
    buttons.forEach(async(button) => {
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent(/Añadir a la lista de lectura/i)
      expect(button).not.toBeDisabled()
      userEvent.click(button)
      await waitFor(() => {
        expect(button).toBeDisabled()
      })
    })
  });
});
