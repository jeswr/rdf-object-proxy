/* eslint-disable no-use-before-define */
import type { Resource } from 'rdf-object';

export type ProxiedResource<T extends string> = {
  [Symbol.iterator](): Iterator<ProxiedResource<T>>;
} & {
  // eslint-disable-next-line no-unused-vars
  [key in Exclude<T, keyof Resource>]: ProxiedResource<T>;
  // TODO: Remove partial based on on2ts
} & Partial<Resource>

// type Obj<T> = T extends keyof Resource ? Resource[T] : (ProxiedResource | undefined)

// export type ProxiedResource = {
//   [key in Exclude<string, keyof Resource>]: Obj<key>;
// } & {
//   [Symbol.iterator](): Iterator<ProxiedResource>;
// }
