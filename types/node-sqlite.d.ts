// Minimal type declarations for node:sqlite.
// The project targets Node.js 22.5+ where node:sqlite is available, but the
// installed @types/node is v20 which does not ship these types.

declare module "node:sqlite" {
  type SQLInput = string | number | bigint | boolean | null | Uint8Array;

  interface RunResult {
    changes: number | bigint;
    lastInsertRowid: number | bigint;
  }

  export class StatementSync {
    run(...params: SQLInput[]): RunResult;
    get<T = unknown>(...params: SQLInput[]): T | undefined;
    all<T = unknown>(...params: SQLInput[]): T[];
    setAllowBareNamedParameters(allow: boolean): void;
    setReadBigInts(enabled: boolean): void;
    setAllowUnknownNamedParameters(allow: boolean): void;
  }

  export interface DatabaseSyncOptions {
    open?: boolean;
    readOnly?: boolean;
    enableForeignKeyConstraints?: boolean;
    enableDoubleQuotedStringLiterals?: boolean;
  }

  export class DatabaseSync {
    constructor(path: string, options?: DatabaseSyncOptions);
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
    close(): void;
    open(): void;
    function(
      name: string,
      options: {
        deterministic?: boolean;
        varargs?: boolean;
        useBigIntArguments?: boolean;
      },
      callback: (...args: unknown[]) => unknown
    ): void;
  }
}
