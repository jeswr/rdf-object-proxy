import { Resource } from 'rdf-object';
import { ProxiedResource } from './types/ProxiedResource';
import { ResourceSet } from './types/ResourceSet';

// TODO: Refactor so only dealing with the list of resources?

// eslint-disable-next-line no-unused-vars
function get<T extends string>({ resource, resources }: ResourceSet, prop: SymbolConstructor['iterator']): () => Generator<ProxiedResource<T>, void, unknown>;
// eslint-disable-next-line no-unused-vars, no-redeclare
function get<T extends string>({ resource, resources }: ResourceSet, prop: string):
ProxiedResource<T>;
// eslint-disable-next-line no-redeclare, consistent-return
function get<T extends string>({ resource, resources }: ResourceSet, prop: string | SymbolConstructor['iterator']): ProxiedResource<T> | (() => Generator<ProxiedResource<T>, void, unknown>) | undefined {
  // @ts-ignore
  if (resource?.[prop] !== undefined) {
    // @ts-ignore
    return resource[prop];
  }
  if (typeof prop === 'string') {
    const hash: Record<string, boolean> = {};
    const results = resources.flatMap((property) => property.properties[prop]).filter((elem) => {
      const stringified = elem.toString();
      if (hash[stringified]) {
        return false;
      }
      hash[stringified] = true;
      return true;
    });
    // eslint-disable-next-line no-use-before-define
    return RdfObjectProxyFactory(resource?.property[prop] ?? results[0], results);
  }
  if (prop === Symbol.iterator) {
    // eslint-disable-next-line func-names
    return function* () {
      for (const r of resources) {
        // eslint-disable-next-line no-use-before-define
        yield RdfObjectProxyFactory(r);
      }
    };
  }
}

export default function RdfObjectProxyFactory<T extends string>(
  resource: Resource,
  resources: Resource[] = [resource],
): ProxiedResource<T> {
  return new Proxy({ resource, resources }, {
    get,
    set(target: ResourceSet, p, value) {
      // @ts-ignore
      return (target.resource.property[p] = value);
    },
    deleteProperty(target, p) {
      try {
        for (const res of target.resources) {
          // @ts-ignore
          delete res.property[p];
        }
        // @ts-ignore
        delete target.resource.property[p];
        return true;
      } catch (e) {
        return false;
      }
    },
    has(target, p) {
      // @ts-ignore
      return target.resources.some((rsrc) => rsrc.properties[p].length > 0);
    },
  }) as unknown as ProxiedResource<T>;
}
