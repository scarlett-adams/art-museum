import type { Feedback } from "@/lib/geo";

export const FEEDBACK_COLOR: Record<Feedback, string> = {
  correct: "bg-correct",
  close: "bg-close",
  far: "bg-far",
};
