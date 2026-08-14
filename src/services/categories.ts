import { isMockMode } from "@/lib/env";
import * as mockCategories from "./mock/categories";
import * as realCategories from "./real/categories";

function impl() {
  return isMockMode() ? mockCategories : realCategories;
}

export const listCategories: typeof mockCategories.listCategories = () => impl().listCategories();
export const createCategory: typeof mockCategories.createCategory = (input) => impl().createCategory(input);
export const updateCategory: typeof mockCategories.updateCategory = (id, input) => impl().updateCategory(id, input);
export const deleteCategory: typeof mockCategories.deleteCategory = (id) => impl().deleteCategory(id);
