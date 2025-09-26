'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load cart from localStorage on initial load
    useEffect(() => {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            setCartItems(JSON.parse(storedCart));
        }
        setLoading(false);
    }, []);

    // Update localStorage whenever cart changes
    useEffect(() => {
        if (!loading) {
            localStorage.setItem('cart', JSON.stringify(cartItems));
        }
    }, [cartItems, loading]);

    // Add item to cart
    const addToCart = (product, quantity = 1, size, color, customization = null) => {
        setCartItems(prevItems => {
            // Check if item already exists in cart
            const existingItemIndex = prevItems.findIndex(
                item =>
                    item.product._id === product._id &&
                    item.size === size &&
                    item.color === color &&
                    JSON.stringify(item.customization) === JSON.stringify(customization)
            );

            if (existingItemIndex !== -1) {
                // Update quantity if item exists
                const updatedItems = [...prevItems];
                updatedItems[existingItemIndex].quantity += quantity;
                toast.success('Cart updated!');
                return updatedItems;
            } else {
                // Add new item
                toast.success('Item added to cart!');
                return [...prevItems, { product, quantity, size, color, customization }];
            }
        });
    };

    // Update cart item
    const updateCartItem = (index, quantity, size, color, customization = null) => {
        setCartItems(prevItems => {
            const updatedItems = [...prevItems];
            updatedItems[index] = {
                ...updatedItems[index],
                quantity,
                size,
                color,
                customization
            };
            toast.success('Cart updated!');
            return updatedItems;
        });
    };

    // Remove item from cart
    const removeFromCart = (index) => {
        setCartItems(prevItems => {
            const updatedItems = prevItems.filter((_, i) => i !== index);
            toast.success('Item removed from cart!');
            return updatedItems;
        });
    };

    // Clear cart
    const clearCart = () => {
        setCartItems([]);
        toast.success('Cart cleared!');
    };

    // Calculate cart totals
    const getCartTotals = () => {
        const subtotal = cartItems.reduce(
            (total, item) => total + item.product.price * item.quantity,
            0
        );

        // Calculate discount if applicable
        const discount = cartItems.reduce(
            (total, item) => {
                if (item.product.discount) {
                    return total + (item.product.price * item.product.discount / 100) * item.quantity;
                }
                return total;
            },
            0
        );

        const tax = (subtotal - discount) * 0.1; // 10% tax
        const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
        const total = subtotal - discount + tax + shipping;

        return {
            subtotal: parseFloat(subtotal.toFixed(2)),
            discount: parseFloat(discount.toFixed(2)),
            tax: parseFloat(tax.toFixed(2)),
            shipping: parseFloat(shipping.toFixed(2)),
            total: parseFloat(total.toFixed(2))
        };
    };

    return (
        <CartContext.Provider
            value={{
                cartItems,
                loading,
                addToCart,
                updateCartItem,
                removeFromCart,
                clearCart,
                getCartTotals
            }}
        >
            {children}
        </CartContext.Provider>
    );
}; 