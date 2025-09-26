/**
 * Helper function to convert FormData to a readable object for debugging
 * @param {FormData} formData - The FormData object to convert
 * @returns {Object} An object representation of the FormData
 */
export const formDataToObject = (formData) => {
    const obj = {};
    
    for (let key of formData.keys()) {
        const values = formData.getAll(key);
        
        if (values.length === 1) {
            // Single value
            const value = values[0];
            if (value instanceof File) {
                obj[key] = `File: ${value.name} (${value.size} bytes)`;
            } else {
                obj[key] = value;
            }
        } else {
            // Multiple values
            obj[key] = values.map(value => {
                if (value instanceof File) {
                    return `File: ${value.name} (${value.size} bytes)`;
                }
                return value;
            });
        }
    }
    
    return obj;
}; 