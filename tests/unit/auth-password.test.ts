import { hashPassword, verifyPassword } from "@/lib/auth/password";

describe("auth password utils", () => {
  it("hashes and verifies password correctly", async () => {
    const raw = "S3curePassword!";
    const hashed = await hashPassword(raw);

    expect(hashed).not.toBe(raw);
    await expect(verifyPassword(raw, hashed)).resolves.toBe(true);
    await expect(verifyPassword("wrong", hashed)).resolves.toBe(false);
  });
});
