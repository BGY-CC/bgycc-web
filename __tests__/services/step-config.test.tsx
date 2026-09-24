import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { STEP_TYPES } from "@/app/(dashboard)/onboarding-editor/_components/step-config";
import { StepEditorModal } from "@/app/(dashboard)/onboarding-editor/_components/step-editor-modal";

describe("onboarding step config", () => {
  it("STEP_TYPES includes a goals step type", () => {
    const goals = STEP_TYPES.find((option) => option.value === "goals");
    expect(goals).toBeTruthy();
    expect(goals?.label).toBe("Goals");
  });

  it("renders the Goals option in the step type selector", () => {
    render(
      <StepEditorModal
        mode="add"
        step={null}
        onClose={() => {}}
        onSave={() => {}}
      />
    );
    expect(screen.getByRole("option", { name: "Goals" })).toBeTruthy();
  });
});