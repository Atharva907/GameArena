"use client";

import CategoryForm from "@/components/Application/Admin/CategoryForm";

function EditCategoryForm({ category }) {
  return <CategoryForm category={category} mode="edit" />;
}

export default EditCategoryForm;
