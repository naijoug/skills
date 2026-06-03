import { describe, expect, it } from "vitest";
import { installPanelAvailability } from "../src/installPanelState";

describe("install panel state", () => {
  it("shows a loading state before target detection finishes", () => {
    expect(installPanelAvailability({ targetCount: 0, busyAction: "loading" })).toBe("loading");
  });

  it("shows unavailable only after loading finishes with no targets", () => {
    expect(installPanelAvailability({ targetCount: 0, busyAction: "" })).toBe("unavailable");
  });

  it("shows install controls when at least one target is available", () => {
    expect(installPanelAvailability({ targetCount: 1, busyAction: "" })).toBe("available");
  });
});
