
// __tests__/AssignTaskToTeam.test.tsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AssignTaskToTeam from "../src/components/manager/AssignTaskToTeam";

jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  getDocs: jest.fn().mockResolvedValue({
    docs: [
      { id: "emp1", data: () => ({ name: "Alice" }) },
      { id: "emp2", data: () => ({ name: "Bob" }) },
    ],
  }),
  updateDoc: jest.fn().mockResolvedValue(undefined),
  doc: jest.fn(),
}));

jest.mock('../src/hooks/use-toast', () => ({
    useToast: () => ({
      toast: jest.fn(),
    }),
}));

test("assign task modal renders and assigns", async () => {
  const onClose = jest.fn();

  render(<AssignTaskToTeam taskId="task123" onClose={onClose} isOpen={true} onOpenChange={() => {}} />);

  // Wait for employees to load
  await waitFor(() => screen.getByText("Alice"));

  // The Select component uses a button as a trigger
  fireEvent.click(screen.getByRole("combobox"));

  // Wait for the options to appear and click one
  await waitFor(() => {
    fireEvent.click(screen.getByText("Alice"));
  });

  fireEvent.click(screen.getByText(/Assign Task/i));

  await waitFor(() => expect(onClose).toHaveBeenCalled());
});
