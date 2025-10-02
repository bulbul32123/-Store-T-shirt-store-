const handleAddProduct = async (formData) => {
    setLoading(true);
    try {
        // Log the FormData keys and files
        console.log("FormData keys:");
        for (let key of formData.keys()) {
            console.log(`- ${key}`);
        }

        // Check if there are image files
        if (formData.has('productImages')) {
            console.log("FormData contains product images");
            // Log the number of files
            const imageFiles = formData.getAll('productImages');
            console.log(`Number of image files: ${imageFiles.length}`);
        } else {
            console.log("No product images in FormData");
        }

        const response = await axios.post(`${API_URL}/products`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        console.log("Product created successfully:", response.data);
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