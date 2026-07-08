export function getImageForColor(product, color) {
    if (!color) {
        return (
            product.colors?.[0]?.images?.[0]?.url ||
            product.images?.[0]?.url ||
            product.images?.[0] ||
            '/placeholder-product.png'
        );
    }

    const colorObj = product.colors?.find(
        (c) => c.name === color || c.code === color
    );

    if (colorObj?.images?.length) {
        return colorObj.images[0].url;
    }

    return (
        product.colors?.[0]?.images?.[0]?.url ||
        product.images?.[0]?.url ||
        product.images?.[0] ||
        '/placeholder-product.png'
    );
}