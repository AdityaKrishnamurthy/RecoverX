import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "ai-revenue-recovery",
  name: "AI Revenue Recovery Engine",
  eventKey: process.env.INNGEST_EVENT_KEY || "test-event-key",
});
