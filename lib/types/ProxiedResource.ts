/* eslint-disable no-use-before-define */
import type { Resource } from 'rdf-object';

type OverridenResource = {
  [K in Exclude<keyof Resource, 'list'>]: Resource[K];
}

export type ProxiedResource<T extends string> = {
  [Symbol.iterator](): Iterator<ProxiedResource<T>>;
} & {
  // eslint-disable-next-line no-unused-vars
  [key in Exclude<T, keyof Resource>]: ProxiedResource<T>;
  // TODO: Remove partial based on on2ts
} & OverridenResource & {
  list?: ProxiedResource<T>[];
} & Resource['properties']

export type AnyResource = ProxiedResource<string>;
