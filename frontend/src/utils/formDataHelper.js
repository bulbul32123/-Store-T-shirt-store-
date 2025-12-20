export const formDataToObject = (formData) => {
    const obj = {};

    for (let key of formData.keys()) {
        const values = formData.getAll(key);
        
        if (values.length === 1) {
            const value = values[0];
            if (value instanceof File) {
                obj[key] = `File: ${value.name} (${value.size} bytes)`;
            } else {
                obj[key] = value;
            }
        } else {
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