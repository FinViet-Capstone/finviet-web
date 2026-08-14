export const queryKeys = {
  users: {
    all: () => ["users"] as const,
    list: (params: unknown) => ["users", "list", params] as const,
  },
  categoryCorrections: {
    all: () => ["category-corrections"] as const,
    list: (params: unknown) => ["category-corrections", "list", params] as const,
  },
  categories: {
    all: () => ["categories"] as const,
  },
  buckets: {
    all: () => ["buckets"] as const,
  },
  scoring: {
    all: () => ["scoring-criteria"] as const,
  },
  plans: {
    all: () => ["plans"] as const,
  },
  documents: {
    all: () => ["knowledge-base-documents"] as const,
  },
  announcements: {
    all: () => ["announcements"] as const,
  },
};
