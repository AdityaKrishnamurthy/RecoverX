import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "recoverx",
  name: "RecoverX Engine",
  eventKey: process.env.INNGEST_EVENT_KEY || "test-event-key",
});
