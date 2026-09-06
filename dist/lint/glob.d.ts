export declare function globToRegExp(pattern: string): RegExp;
/** Does `path` (relative, `/`-separated) match any of these globs? */
export declare function matchesAny(path: string, patterns: readonly string[]): boolean;
