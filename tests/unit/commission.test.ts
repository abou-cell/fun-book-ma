import { calculateCheckoutAmounts } from "@/lib/financials/commission";

describe("commission calculation", () => {
  it("calculates subtotal, commission, payout and total", () => {
    const result = calculateCheckoutAmounts(1000, 25, 0.15);

    expect(result.commissionAmount).toBe(150);
    expect(result.providerPayoutAmount).toBe(850);
    expect(result.total).toBe(1025);
  });
});
