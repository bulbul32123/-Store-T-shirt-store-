import { useState } from "react";

const initialForm = {
  name: "",
  description: "",
  price: "",
  category: "",
  stock: "",
  sizes: [],
  colors: [],
  newDrop: false,
  discount: "0",
  featured: false,
  popular: false,
  isFreeShipping: false,
};

export function useProductForm(seed = {}) {
  const [formData, setFormData] = useState({ ...initialForm, ...seed });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      if (name === "sizes") {
        setFormData((prev) => ({
          ...prev,
          sizes: checked
            ? [...prev.sizes, value]
            : prev.sizes.filter((s) => s !== value),
        }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: checked }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const setDescription = (html) =>
    setFormData((prev) => ({ ...prev, description: html }));

  const setColors = (colors) => setFormData((prev) => ({ ...prev, colors }));

  const validate = () => {
    if (
      !formData.name ||
      formData.description === "<p></p>" ||
      !formData.price ||
      !formData.category ||
      !formData.stock
    ) {
      return "Please fill in all required fields";
    }
    if (!formData.colors || formData.colors.length === 0) {
      return "Please add at least one color variant";
    }
    const missing = formData.colors.filter(
      (c) => !c.images || c.images.length === 0,
    );
    if (missing.length > 0) {
      return `Please add at least one image to: ${missing.map((c) => c.name).join(", ")}`;
    }
    return null;
  };

  const buildPayload = () => ({
    name: formData.name,
    description: formData.description,
    price: parseFloat(formData.price),
    category: formData.category,
    stock: parseInt(formData.stock),
    sizes: formData.sizes,
    colors: formData.colors,
    discount: parseInt(formData.discount) || 0,
    featured: formData.featured,
    popular: formData.popular,
    newDrop: formData.newDrop,
    isFreeShipping: formData.isFreeShipping,
  });

  return {
    formData,
    setFormData,
    handleChange,
    setDescription,
    setColors,
    validate,
    buildPayload,
  };
}
