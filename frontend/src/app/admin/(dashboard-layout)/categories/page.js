"use client";
import CategoryForm from "@/components/admin/CategoryForm";
import CategoryListSkeleton from "@/components/admin/LoadingSkeletons/CategoryListSkeleton";
import ConfirmModal from "@/components/common/ConfirmModal";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useAuth } from "@/context/AuthContext";
import { API_URL } from "@/utils/config";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiEdit2, FiTrash2, FiPlus, FiEye } from "react-icons/fi";
export default function AdminCategories() {
  const { user, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      toast.error("Access denied. Admins only.");
      router.push("/auth/login");
      return;
    }

    if (user && user.role === "admin") {
      fetchCategories();
    }
  }, [user, authLoading, router]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/api/categories`);
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    setEditCategory(null);
    setShowForm(true);
  };

  const handleEditCategory = (category) => {
    setEditCategory(category);
    setShowForm(true);
  };

  const handleDeleteCategory = (category) => {
    setDeleteTarget(category);
  };

  const confirmDeleteCategory = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/categories/${deleteTarget._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Category deleted successfully");
      setDeleteTarget(null);
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      if (error.response?.status === 400) {
        toast.error(error.response.data.message || "Unable to delete category");
      } else {
        toast.error("Failed to delete category");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCategorySave = async (categoryData) => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem("token");
      const isEditing = !!editCategory;
      const formData = new FormData();

      // Append other form data
      Object.keys(categoryData).forEach((key) => {
        if (
          key !== "image" ||
          (key === "image" && categoryData[key] instanceof File)
        ) {
          formData.append(key, categoryData[key]);
        }
      });

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      };

      if (isEditing) {
        await axios.put(
          `${API_URL}/api/categories/${editCategory._id}`,
          formData,
          config,
        );
        toast.success("Category updated successfully");
      } else {
        await axios.post(`${API_URL}/api/categories`, formData, config);
        toast.success("Category added successfully");
      }

      setShowForm(false);

      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Failed to save category");
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center w-full h-full mt-9">
        <CategoryListSkeleton size="large" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Category Management
        </h1>

        <button
          onClick={handleAddCategory}
          className="bg-[#CAEF96] text-black hover:bg-[#CAEF96]/80 px-4 py-2 rounded-md  flex items-center"
        >
          <FiPlus className="mr-2" />
          Add Category
        </button>
      </div>

      {showForm ? (
        <CategoryForm
          category={editCategory}
          categories={categories}
          onSave={handleCategorySave}
          onCancel={() => setShowForm(false)}
          isSaving={isSaving}
        />
      ) : loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="large" />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Featured
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <tr key={category._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 relative">
                          {category.image?.url ? (
                            <img
                              src={category.image.url}
                              alt={category.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-xs text-gray-500">
                                No img
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {category.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {category.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          category.featured
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {category.featured ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <FiEdit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <FiTrash2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() =>
                            router.push(`/category/${category.slug}`)
                          }
                          className="text-gray-600 hover:text-gray-900"
                          title="View on site"
                        >
                          <FiEye className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="3"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No categories found. Create your first category!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDeleteCategory}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmText="Delete"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
