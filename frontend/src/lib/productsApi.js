import axios from "axios";
import { API_URL } from "@/utils/config";

export const productsApi = {
  getProducts: async (params = {}) => {
    const clean = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== "" && v != null),
    );
    const { data } = await axios.get(`${API_URL}/api/products`, {
      params: clean,
    });
        console.log("data", data);
        
    return data;
  },
  getAvailableColors: async () => {
    const { data } = await axios.get(
      `${API_URL}/api/products/colors/available`,
    );
    return data;
  },
  getCategories: async () => {
      const { data } = await axios.get(`${API_URL}/api/categories`);
      console.log("category:", data);
    return data.categories;
  },
};
