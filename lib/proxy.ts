import { Resource } from 'rdf-object';
import { ProxiedResource } from './types/ProxiedResource';
import { ResourceSet } from './types/ResourceSet';

type KeyMap = {
  term: true,
  predicates: true,
  propertiesUri: true,
  properties: true,
  property: true,
  type: true,
  value: true,
  isA: true,
  addProperty: true,
  toString: true,
  toJSON: true,
  toQuads: true,
  // list: false - we ovveride lsit
}

const existingTerms: KeyMap  = {
  term: true,
  predicates: true,
  propertiesUri: true,
  properties: true,
  property: true,
  type: true,
  value: true,
  isA: true,
  addProperty: true,
  toString: true,
  toJSON: true,
  toQuads: true,
} as const;


function get<T extends string>(resources: Resource[], p: string | symbol | number): any {
  const resource = resources[0];
  if (resource && p === 'list') {
    return resource.list?.map(resource => proxiedResource(resource))
  }
  if (resource && p in resource) {
    // TODO: Remove typecasting by making 'in' trap work propely
    return resource[p as keyof Resource]
  }
  
  
  if (typeof p === 'string')
  
  if (typeof p === 'string' && p in existingTerms) {
    // TODO: Remove type casting
    return resources[0]?.[p as keyof KeyMap];
  } else if (p === 'list') {
    return resources[0]?.list?.map(resource => proxiedResource(resource))
  }
}

    
    addProperty(predicate: Resource, object: Resource): void;
    /**
     * @return {string} The string representation of a Resource
     */
    toString(): string;
    /**
     * Create a convenient JSON representation of a Resource.
     */
    toJSON(): any;
    /**
     * Convert this resource into an array of RDF quads.
     */
    toQuads(quads?: RDF.BaseQuad[], dataFactory?: RDF.DataFactory<RDF.BaseQuad>): RDF.BaseQuad[];



// TODO: Refactor so only dealing with the list of resources?

// eslint-disable-next-line no-unused-vars
function get<T extends string>({ resource, resources }: ResourceSet, prop: SymbolConstructor['iterator']): () => Generator<ProxiedResource<T>, void, unknown>;
// eslint-disable-next-line no-unused-vars, no-redeclare
function get<T extends string>({ resource, resources }: ResourceSet, prop: string):
ProxiedResource<T>;
// eslint-disable-next-line no-redeclare, consistent-return
function get<T extends string>({ resource, resources }: ResourceSet, prop: string | SymbolConstructor['iterator']): ProxiedResource<T> | (() => Generator<ProxiedResource<T>, void, unknown>) | undefined {
  // @ts-ignore
  if (prop === 'list') {
    // eslint-disable-next-line no-use-before-define
    // @ts-ignore
    return resource?.list?.map((x) => RdfObjectProxyFactory(x));
  }
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
      // TODO: Fix to return value of operation
      // @ts-ignore
      return (target.resource.property[p] = value);
    },
    deleteProperty(target, p) {
      // TODO: Fix - return whether all passed (boolean output), not tryh-catch
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
