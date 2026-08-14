import { isMockMode } from "@/lib/env";
import * as mockBuckets from "./mock/buckets";
import * as realBuckets from "./real/buckets";

function impl() {
  return isMockMode() ? mockBuckets : realBuckets;
}

export const listBuckets: typeof mockBuckets.listBuckets = () => impl().listBuckets();
export const updateBucket: typeof mockBuckets.updateBucket = (id, input) => impl().updateBucket(id, input);
