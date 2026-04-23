import { GET } from "@/app/api/health/route";

describe("health route", () => {
  it("returns a response object", async () => {
    const response = await GET();
    expect([200, 503]).toContain(response.status);
  });
});
