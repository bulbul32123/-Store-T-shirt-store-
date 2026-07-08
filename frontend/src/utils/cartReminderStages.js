// Reminder stages data and delays (milliseconds)
export const CART_REMINDER_KEY = 'cart_reminder';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

export const STAGES = [
    {
        id: 1,
        delay: 30 * MINUTE, // 30 minutes after updatedAt
        headline: 'Your cart is waiting',
        message: 'Looks like you left something behind.',
        cta: 'Continue Checkout',
    },
    {
        id: 2,
        delay: 2 * HOUR, // 2 hours
        headline: 'Still thinking?',
        message: 'Everything is still waiting for you.',
        cta: 'View Cart',
    },
    {
        id: 3,
        delay: 24 * HOUR, // 24 hours
        headline: "Don't miss your favorites",
        message: 'Your saved items are waiting whenever you\'re ready.',
        cta: 'Checkout Now',
    },
    {
        id: 4,
        delay: 3 * 24 * HOUR, // 3 days
        headline: 'Your cart misses you',
        message: 'Complete your order before items sell out.',
        cta: 'Return to Cart',
    },
];

export default STAGES;
