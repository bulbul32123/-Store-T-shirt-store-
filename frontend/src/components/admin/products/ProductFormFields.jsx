"use client";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
const STATUS_FLAGS = [
  { name: "featured", label: "Featured" },
  { name: "popular", label: "Popular" },
  { name: "newDrop", label: "New Drop" },
  { name: "isFreeShipping", label: "Free Shipping" },
];

export default function ProductFormFields({
  formData,
  handleChange,
  setDescription,
  categories,
}) {
  return (
    <>
      <div>
        <h2 className="text-lg font-medium text-gray-800 mb-4">
          Basic Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="name" className="mb-1 block">
              Product Name *
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="focus-visible:ring-[#ffb803]"
            />
          </div>

          <div>
            <Label htmlFor="category" className="mb-1 block">
              Category *
            </Label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full h-9 border border-gray-300 rounded-md px-3 outline-[#ffb803] focus:ring-[#ffb803] focus:border-[#ffb803] text-sm"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="price" className="mb-1 block">
              Price ($) *
            </Label>
            <Input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              required
              className="focus-visible:ring-[#ffb803]"
            />
          </div>

          <div>
            <Label htmlFor="stock" className="mb-1 block">
              Stock Quantity *
            </Label>
            <Input
              id="stock"
              name="stock"
              type="number"
              min="0"
              value={formData.stock}
              onChange={handleChange}
              required
              className="focus-visible:ring-[#ffb803]"
            />
          </div>

          <div>
            <Label htmlFor="discount" className="mb-1 block">
              Discount (%)
            </Label>
            <Input
              id="discount"
              name="discount"
              type="number"
              min="0"
              max="100"
              value={formData.discount}
              onChange={handleChange}
              className="focus-visible:ring-[#ffb803]"
            />
          </div>
        </div>

        <div className="mt-6">
          <Label className="mb-1 block">Description *</Label>
          <RichTextEditor
            value={formData.description}
            onChange={setDescription}
          />
        </div>
      </div>

      <div>
        <Label className="mb-2 block">Available Sizes</Label>
        <div className="flex flex-wrap gap-4">
          {SIZES.map((size) => (
            <label key={size} className="inline-flex items-center">
              <input
                type="checkbox"
                name="sizes"
                value={size}
                checked={formData.sizes.includes(size)}
                onChange={handleChange}
                className="h-4 w-4 text-[#ffb803] focus:ring-[#ffb803] border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700 font-medium">
                {size}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <h2 className="text-lg font-medium text-gray-800 mb-4">
          Product Status
        </h2>
        <div className="flex flex-wrap gap-6">
          {STATUS_FLAGS.map((flag) => (
            <label key={flag.name} className="inline-flex items-center">
              <input
                type="checkbox"
                name={flag.name}
                checked={formData[flag.name]}
                onChange={handleChange}
                className="h-4 w-4 text-[#ffb803] focus:ring-[#ffb803] border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">{flag.label}</span>
            </label>
          ))}
        </div>
      </div>
    </>
  );
}
