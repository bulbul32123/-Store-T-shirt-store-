export function getCartVisitMessage(itemCount) {
    if (itemCount > 0) {
        return {
            headline: 'Still in your cart',
            message: `You've got ${itemCount} item${itemCount > 1 ? 's' : ''} waiting. Ready to check out?`,
            cta: 'View Cart',
            href: '/cart',
        };
    }
    return {
        headline: 'Your cart is empty',
        message: "Browse our latest arrivals and find something you'll love.",
        cta: 'Start Shopping',
        href: '/products',
    };
}

export function getWatchlistVisitMessage(itemCount) {
    if (itemCount > 0) {
        return {
            headline: 'Saved for later',
            message: `${itemCount} item${itemCount > 1 ? 's' : ''} on your watchlist are still available.`,
            cta: 'View Watchlist',
            href: '/profile/watchlist',
        };
    }
    return {
        headline: 'Nothing saved yet',
        message: 'Tap the heart on something you love to save it for later.',
        cta: 'Explore Products',
        href: '/products',
    };
}