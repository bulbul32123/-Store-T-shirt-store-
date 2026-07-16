const BUYNOW_KEY = "buynow_item";

export function setBuyNowItem(item) {
  sessionStorage.setItem(BUYNOW_KEY, JSON.stringify(item));
}

export function getBuyNowItem() {
  try {
    const raw = sessionStorage.getItem(BUYNOW_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearBuyNowItem() {
  sessionStorage.removeItem(BUYNOW_KEY);
}
