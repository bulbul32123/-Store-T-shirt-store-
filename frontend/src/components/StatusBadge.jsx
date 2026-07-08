'use client';

const PAYMENT_STYLES = {
    paid: 'bg-green-100 text-green-700 border-green-200',
    unpaid: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    failed: 'bg-red-100 text-red-700 border-red-200',
    refunded: 'bg-purple-100 text-purple-700 border-purple-200'
};

const FULFILLMENT_STYLES = {
    pending: 'bg-gray-100 text-gray-700 border-gray-200',
    processing: 'bg-blue-100 text-blue-700 border-blue-200',
    confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
    shipped: 'bg-orange-100 text-orange-700 border-orange-200',
    delivered: 'bg-green-100 text-green-700 border-green-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200'
};

const LABELS = {
    pending: 'Pending',
    processing: 'Processing',
    confirmed: 'Confirmed',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    paid: 'Paid',
    unpaid: 'Unpaid',
    failed: 'Failed',
    refunded: 'Refunded'
};

export function PaymentBadge({ status }) {
    return (
        <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                PAYMENT_STYLES[status] || PAYMENT_STYLES.unpaid
            }`}
        >
            {LABELS[status] || status}
        </span>
    );
}

export function FulfillmentBadge({ status }) {
    return (
        <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                FULFILLMENT_STYLES[status] || FULFILLMENT_STYLES.pending
            }`}
        >
            {LABELS[status] || status}
        </span>
    );
}
