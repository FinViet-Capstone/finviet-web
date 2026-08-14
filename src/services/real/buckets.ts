import type { AdminBucket, BucketInput } from "@/types/buckets";

// Bucket is a pure seed/lookup table in finviet-be with no admin CRUD endpoint yet
// (see context/project-spec.md Feature D's gap note) — new backend work needed.

export async function listBuckets(): Promise<AdminBucket[]> {
  throw new Error("Not implemented: finviet-be has no bucket list endpoint yet");
}

export async function updateBucket(_id: string, _input: BucketInput): Promise<AdminBucket> {
  throw new Error("Not implemented: finviet-be has no bucket update endpoint yet");
}
