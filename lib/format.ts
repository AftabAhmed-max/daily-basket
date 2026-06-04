export const formatINR = (amount: number) =>
  "₹" +
  Number(amount).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });

export type StockState = "in" | "low" | "out";

export const stockState = (qty: number): StockState =>
  qty <= 0 ? "out" : qty <= 5 ? "low" : "in";

export const stockLabel = (qty: number) => {
  const s = stockState(qty);
  if (s === "out") return "Out of Stock";
  if (s === "low") return `Only ${qty} left`;
  return "In Stock";
};
