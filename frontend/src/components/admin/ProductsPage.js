const handleAddProduct = async (formData) => {
    setLoading(true);
    try {
        for (let key of formData.keys()) {
            console.log(`- ${key}`);
        }
        if (formData.has('productImages')) {
            const imageFiles = formData.getAll('productImages');
        } else {
            console.log("No product images in FormData");
        }

        const response = await axios.post(`${API_URL}/products`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        toast.success('Product added successfully');
        fetchProducts();
        setShowForm(false);
    } catch (error) {
        console.error('Error adding product:', error);
        toast.error(error.response?.data?.message || 'Failed to add product');
    } finally {
        setLoading(false);
    }
}; 