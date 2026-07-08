export function parseDiscount(discount) {
    if (!discount) return 0;
  
    if (typeof discount === "string" && discount.includes("%")) {
      return parseFloat(discount.replace("%", ""));
    }
  
    return 0;
  }
  
  export function calculateFinalPrice(price, discount) {
    const percent = parseDiscount(discount);
    if (!percent) return price;
  
    return Math.round(price - (price * percent) / 100);
  }
  