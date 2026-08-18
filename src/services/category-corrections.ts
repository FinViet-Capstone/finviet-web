import { isMockMode } from "@/lib/env";
import * as mockCorrections from "./mock/category-corrections";
import * as realCorrections from "./real/category-corrections";

function impl() {
  return isMockMode("category-corrections") ? mockCorrections : realCorrections;
}

export const listCorrections: typeof mockCorrections.listCorrections = (params) => impl().listCorrections(params);
export const exportCorrections: typeof mockCorrections.exportCorrections = (params) =>
  impl().exportCorrections(params);
