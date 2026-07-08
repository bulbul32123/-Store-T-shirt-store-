const HOUR = 60 * 60 * 1000;

export function getCartMood(items, updatedAt, now = Date.now()) {
    if (!items.length) {
        return {
            headline: 'Your cart is empty',
            message: 'It\'s a little lonely in here. Find something it can hold onto.',
        };
    }

    const hoursSince = updatedAt ? (now - updatedAt) / HOUR : 0;

    if (hoursSince > 24) {
        return {
            headline: 'Still here, still waiting',
            message: `${items.length} item${items.length > 1 ? 's' : ''} have been sitting for a while. Ready to check out?`,
        };
    }

    if (hoursSince > 2) {
        return {
            headline: 'Cart\'s ready to launch',
            message: 'Everything\'s picked out. Just say the word — checkout whenever you are.',
        };
    }

    return {
        headline: 'Nice picks',
        message: `${items.length} item${items.length > 1 ? 's' : ''} added. Keep browsing or check out now.`,
    };
}

export function getWatchlistMood(items, updatedAt, now = Date.now()) {
    if (!items.length) {
        return {
            headline: 'Nothing saved yet',
            message: 'Tap the heart on something you love and it\'ll show up here.',
        };
    }

    const hoursSince = updatedAt ? (now - updatedAt) / HOUR : 0;

    if (hoursSince > 24) {
        return {
            headline: 'Been waiting a day',
            message: `${items.length} saved item${items.length > 1 ? 's' : ''} are still here. Ready to make it official?`,
        };
    }

    return {
        headline: 'Saved for later',
        message: `${items.length} item${items.length > 1 ? 's' : ''} saved. No rush — they\'ll keep.`,
    };
}


      