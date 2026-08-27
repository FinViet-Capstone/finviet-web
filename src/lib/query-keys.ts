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
  aiPrompts: {
    all: () => ["ai-prompt-configs"] as const,
    history: (featureKey: string) => ["ai-prompt-configs", "history", featureKey] as const,
  },
  announcements: {
    all: () => ["announcements"] as const,
  },
  admins: {
    all: () => ["admins"] as const,
  },
  overview: {
    summary: () => ["overview", "summary"] as const,
    trend: (metric: string, days: number) => ["overview", "trend", metric, days] as const,
  },
  adminSession: {
    current: () => ["admin-session"] as const,
  },
};
