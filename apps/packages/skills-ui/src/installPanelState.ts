export type InstallPanelAvailability = "loading" | "unavailable" | "available";

export function installPanelAvailability(input: { targetCount: number; busyAction: string }): InstallPanelAvailability {
  if (input.busyAction === "loading") {
    return "loading";
  }
  return input.targetCount > 0 ? "available" : "unavailable";
}
