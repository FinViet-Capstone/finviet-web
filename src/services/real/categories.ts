import type { AdminCategory, CategoryInput } from "@/types/categories";

// finviet-be's CategoriesController already has real create/update/delete endpoints
// (POST/PATCH/DELETE /api/categories, [Authorize(Roles = "Admin")]) per
// context/project-spec.md Feature D — but no confirmed list/GET endpoint exists yet, so this
// domain can't fully flip real until that's added. customIconDataUrl stays mock-only regardless
// (no storage endpoint exists for uploaded icons, see context/backend-gaps.md).

export async function listCategories(): Promise<AdminCategory[]> {
  throw new Error("Not implemented: finviet-be has no category list endpoint yet");
}

export async function createCategory(_input: CategoryInput): Promise<AdminCategory> {
  throw new Error("Not implemented: category CRUD wiring pending JWT propagation");
}

export async function updateCategory(_id: string, _input: CategoryInput): Promise<AdminCategory> {
  throw new Error("Not implemented: category CRUD wiring pending JWT propagation");
}

export async function deleteCategory(_id: string): Promise<{ id: string }> {
  throw new Error("Not implemented: category CRUD wiring pending JWT propagation");
}
