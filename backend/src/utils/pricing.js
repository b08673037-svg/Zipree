// Backend-only pricing. Never trust frontend totals.
// All monetary values are numbers (USD). Round to 2 decimals on output.

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const TAX_RATE = 0.08; // 8% — adjust here if business rules change

export function calculateRentalDays(pickup, returnAt) {
  const diff = new Date(returnAt).getTime() - new Date(pickup).getTime();
  if (diff <= 0) return 0;
  return Math.max(1, Math.ceil(diff / MS_PER_DAY));
}

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

// Build the immutable price snapshot for a booking.
// `extras` is an array of { name, pricePerDay } — validated by the controller.
export function calculatePriceSnapshot({ car, pickup, returnAt, extras = [] }) {
  const days = calculateRentalDays(pickup, returnAt);
  const dailyPrice = car.dailyPrice;

  const baseSubtotal = dailyPrice * days;

  const extrasSnapshot = extras.map((e) => ({
    name: String(e.name),
    pricePerDay: Number(e.pricePerDay),
    lineTotal: round2(Number(e.pricePerDay) * days),
  }));
  const extrasTotal = extrasSnapshot.reduce((sum, e) => sum + e.lineTotal, 0);

  const subtotal = round2(baseSubtotal + extrasTotal);
  const taxes = round2(subtotal * TAX_RATE);
  const total = round2(subtotal + taxes);

  return {
    dailyPrice,
    days,
    baseSubtotal: round2(baseSubtotal),
    extras: extrasSnapshot,
    subtotal,
    taxes,
    total,
    taxRate: TAX_RATE,
    currency: "USD",
  };
}