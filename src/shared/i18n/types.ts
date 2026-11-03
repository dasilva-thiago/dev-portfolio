import type en from "./resources/en.json";

export type Resources = typeof en;

type Join<K extends string, P extends string> = P extends "" ? K : `${K}.${P}`;

type PathsTo<T, Leaf> = T extends Leaf
  ? ""
  : T extends readonly unknown[] | string | number | boolean
    ? never
    : T extends object
      ? {
          [K in keyof T & string]: PathsTo<T[K], Leaf> extends infer P
            ? P extends string
              ? Join<K, P>
              : never
            : never;
        }[keyof T & string]
      : never;

export type StringKey = PathsTo<Resources, string>;
export type ListKey = PathsTo<Resources, readonly string[]>;
