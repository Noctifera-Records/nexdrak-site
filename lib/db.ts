type DbQueryResult<Row = any> = { rows: Row[] };
type DbLike = { query: (sql: string, params?: unknown[]) => Promise<DbQueryResult> };

export const db: DbLike = {
  query: async () => ({ rows: [] }),
};
