/* eslint-disable no-return-assign */
/* eslint-disable no-unused-vars */
/* eslint-disable no-use-before-define */
/* eslint-disable no-redeclare */
import { Resource } from 'rdf-object';
import { ProxiedResource } from './types/ProxiedResource';

function get<T extends string, K extends string>(resources: Resource[], p: SymbolConstructor['iterator']):
() => Generator<ProxiedResource<T>, void, unknown>;
function get<T extends string, K extends string>(resources: Resource[], p: K):
K extends keyof Resource ? Resource[K] : ProxiedResource<T> ;
function get<T extends string, K extends string>(resources: Resource[], p: string | symbol):
(K extends keyof Resource ? ('list' extends K ? ProxiedResource<T>[] : Resource[K]) : ProxiedResource<T>)
| (() => Generator<ProxiedResource<T>, void, unknown>)
| undefined {
  switch (typeof p) {
    case 'symbol': {
      if (p === Symbol.iterator) {
        return function* generate() {
          for (const resource of resources) {
            yield proxiedResource(resource);
          }
        };
      }
      return undefined;
    }
    case 'string': {
      for (const resource of resources) {
        if (p in resource) {
          const result = resource[p as keyof Resource];
          if (p === 'list') {
            // @ts-ignore
            return (result as Resource[]).map((r) => proxiedResource(r));
          }
          // @ts-ignore
          return result;
        }
      }
      if (p === 'valueOf' && resources.length === 0) {
        // @ts-ignore
        return () => undefined;
      }
      if (p === 'typeOf' && resources.length === 0) {
        // @ts-ignore
        return () => undefined;
      }
      const hash: Record<string, boolean> = {};
      const results = resources.flatMap((resource) => resource.properties[p]).filter((elem) => {
        const stringified = elem.toString();
        if (hash[stringified]) {
          return false;
        }
        hash[stringified] = true;
        return true;
      });
      // @ts-ignore
      return proxiedResource(results);
    }
    default:
      return undefined;
  }
}

export default function proxiedResource<T extends string>(resources: Resource | Resource[]):
ProxiedResource<T> {
  let r: Resource[] = [];
  if (Array.isArray(resources)) {
    r = resources;
  } else {
    r = [resources];
  }
  return new Proxy(r, {
    get,
    set(target: Resource[], p, value) {
      for (const resource of target) {
        // @ts-ignore
        resource.property[p] = value;
      }
      return true;
    },
    deleteProperty(target, p) {
      // TODO: Fix - return whether all passed (boolean output), not tryh-catch
      try {
        for (const res of target) {
          // @ts-ignore
          delete res.property[p];
        }
        return true;
      } catch (e) {
        return false;
      }
    },
    has(target, p) {
      // @ts-ignore
      return target.some((rsrc) => rsrc.properties[p].length > 0);
    },
  }) as unknown as ProxiedResource<T>;
}
