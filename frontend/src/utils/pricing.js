export function computeFinalPrice(product) {
  const discount = Number(product.discount || 0);
  return discount > 0
    ? +(product.price - (product.price * discount) / 100).toFixed(2)
    : product.price;
}
