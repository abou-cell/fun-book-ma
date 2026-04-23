import { bookingRequestSchema } from "@/lib/booking/validation";

describe("booking validation", () => {
  it("rejects invalid payload", () => {
    const parsed = bookingRequestSchema.safeParse({
      activityId: "",
      scheduleId: "",
      participants: 0,
      customerName: "A",
      customerEmail: "bad",
    });

    expect(parsed.success).toBe(false);
  });
});
