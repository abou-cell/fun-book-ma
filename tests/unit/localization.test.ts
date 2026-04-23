import { formatCurrency, formatPhoneNumber } from "@/lib/localization/format";

describe("localization utilities", () => {
  it("formats MAD currency and Moroccan numbers", () => {
    expect(formatCurrency(120.5, "fr")).toContain("120");
    expect(formatPhoneNumber("0612345678")).toContain("+212");
  });
});
