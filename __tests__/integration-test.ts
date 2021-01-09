/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-undef */
import { RdfObjectLoader, Resource } from 'rdf-object';
import { triple, namedNode, literal } from '@rdfjs/data-model';
import { RdfObjectProxy } from '../lib';

// TODO: testing push
// TODO: Fix types when setting

// Initialize our loader with a JSON-LD context
const context = {
  rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
  type: 'rdf:type',
  label: 'rdfs:label',
  foaf: 'http://xmlns.com/foaf/0.1/',
  knows: 'foaf:knows',
  name: 'foaf:name',
  ex: 'http://example.org/',
};

// Triples
const triples = () => [
  triple(
    namedNode('http://example.org/myResource'),
    namedNode('http://www.w3.org/2000/01/rdf-schema#label'),
    namedNode('http://example.org/Resource1'),
  ),
  triple(
    namedNode('http://example.org/myResource'),
    namedNode('http://www.w3.org/2000/01/rdf-schema#label'),
    namedNode('http://example.org/Resource2'),
  ),
  triple(
    namedNode('http://example.org/Resource2'),
    namedNode('http://www.w3.org/2000/01/rdf-schema#label'),
    namedNode('http://example.org/Resource3'),
  ),
  triple(
    namedNode('http://example.org/Resource1'),
    namedNode('http://www.w3.org/2000/01/rdf-schema#label'),
    literal('My Resource'),
  ),
];

describe('Basic API test', () => {
  it('Should traverse length 2 paths', async () => {
    const myLoader = new RdfObjectLoader({ context });
    await myLoader.importArray(triples());
    const proxiedResource = RdfObjectProxy(myLoader.resources['http://example.org/myResource']);

    const labels = [];
    for (const label of proxiedResource.label.label) {
      labels.push(`${label}`);
    }
    expect(labels).toEqual([
      'My Resource',
      'http://example.org/Resource3',
    ]);
  });
  it('Should return single object only when not in loop', async () => {
    const myLoader = new RdfObjectLoader({ context });
    await myLoader.importArray(triples());
    const proxiedResource = RdfObjectProxy(myLoader.resources['http://example.org/myResource']);
    expect(`${proxiedResource.label.label}`).toEqual('My Resource');
  });
});

const triplesCircular = () => [
  triple(
    namedNode('http://example.org/myResource'),
    namedNode('http://www.w3.org/2000/01/rdf-schema#label'),
    namedNode('http://example.org/myResource'),
  ),
  triple(
    namedNode('http://example.org/myResource'),
    namedNode('http://www.w3.org/2000/01/rdf-schema#label'),
    namedNode('http://example.org/Resource2'),
  ),
  triple(
    namedNode('http://example.org/myResource'),
    namedNode('http://www.w3.org/2000/01/rdf-schema#label'),
    namedNode('http://example.org/Resource1'),
  ),
  triple(
    namedNode('http://example.org/Resource2'),
    namedNode('http://www.w3.org/2000/01/rdf-schema#label'),
    namedNode('http://example.org/Resource2'),
  ),
  triple(
    namedNode('http://example.org/Resource2'),
    namedNode('http://www.w3.org/2000/01/rdf-schema#label'),
    namedNode('http://example.org/Resource3'),
  ),
  triple(
    namedNode('http://example.org/Resource1'),
    namedNode('http://www.w3.org/2000/01/rdf-schema#label'),
    literal('My Resource'),
  ),
];

describe('Testing ciruclar references', () => {
  it('Should traverse length 2 paths', async () => {
    const myLoader = new RdfObjectLoader({ context });
    await myLoader.importArray(triplesCircular());
    const proxiedResource = RdfObjectProxy(myLoader.resources['http://example.org/myResource']);

    const labels = [];
    for (const label of proxiedResource.label.label) {
      labels.push(`${label}`);
    }
    expect(labels).toEqual([
      'http://example.org/myResource',
      'http://example.org/Resource2',
      'http://example.org/Resource1',
      'http://example.org/Resource3',
      'My Resource',
    ]);
  });
  it('Should return single object only when not in loop', async () => {
    const myLoader = new RdfObjectLoader({ context });
    await myLoader.importArray(triplesCircular());
    const proxiedResource = RdfObjectProxy(myLoader.resources['http://example.org/myResource']);
    expect(`${proxiedResource.label.label}`).toEqual('http://example.org/myResource');
  });
});

describe('Get RDF object properties', () => {
  it('Should traverse length 2 paths', async () => {
    const myLoader = new RdfObjectLoader({ context });
    await myLoader.importArray(triplesCircular());
    const proxiedResource = RdfObjectProxy(myLoader.resources['http://example.org/myResource']);

    const labels = [];
    for (const label of proxiedResource.label.label) {
      labels.push(`${label.type}`);
    }
    expect(labels).toEqual([
      'NamedNode',
      'NamedNode',
      'NamedNode',
      'NamedNode',
      'Literal',
    ]);
  });
  it('Should return single object only when not in loop', async () => {
    const myLoader = new RdfObjectLoader({ context });
    await myLoader.importArray(triples());
    const proxiedResource = RdfObjectProxy(myLoader.resources['http://example.org/myResource']);
    expect(`${proxiedResource.label?.label}`).toEqual('My Resource');
  });
});

describe('Handling undefined properties', () => {
  it('Return empty iterator on undefined property', async () => {
    const myLoader = new RdfObjectLoader({ context });
    await myLoader.importArray(triples());
    const proxiedResource = RdfObjectProxy(myLoader.resources['http://example.org/myResource']);

    const labels = [];
    for (const label of proxiedResource.label.label.label) {
      labels.push(`${label}`);
    }
    expect(labels).toEqual([]);
  });
  it('Should be falsy when looking for non existent property', async () => {
    const myLoader = new RdfObjectLoader({ context });
    await myLoader.importArray(triples());
    const proxiedResource = RdfObjectProxy(myLoader.resources['http://example.org/myResource']);

    expect('left' in proxiedResource).toBeFalsy();
    expect('label' in proxiedResource).toBeTruthy();
    expect('http://www.w3.org/2000/01/rdf-schema#label' in proxiedResource).toBeTruthy();
  });
});

describe('Be able to set properties', () => {
  it('Each property should be able to be set', async () => {
    const myLoader = new RdfObjectLoader({ context });
    await myLoader.importArray(triples());
    const proxiedResource = RdfObjectProxy(myLoader.resources['http://example.org/myResource']);

    for (const predicate of proxiedResource?.predicates ?? []) {
      // @ts-ignore
      proxiedResource[predicate.value] = new Resource({ term: literal('Name') });
      expect(`${proxiedResource[predicate.value]}`).toEqual(`${new Resource({ term: literal('Name') })}`);
    }
  });
});

describe('Be able to delete properties', () => {
  it('Each property should be able to be delete', async () => {
    const myLoader = new RdfObjectLoader({ context });
    await myLoader.importArray(triples());
    const proxiedResource = RdfObjectProxy(myLoader.resources['http://example.org/myResource']);

    for (const predicate of proxiedResource?.predicates ?? []) {
      expect(predicate.value in proxiedResource).toEqual(true);
      // delete proxiedResource[predicate.value];
      // expect(predicate.value in proxiedResource).toEqual(false);
    }
    for (const predicate of proxiedResource?.predicates ?? []) {
      // expect(predicate.value in proxiedResource).toEqual(true);
      delete proxiedResource[predicate.value];
      expect(predicate.value in proxiedResource).toEqual(false);
    }
  });
  it('Each property should be able to be delete without weird side effects', async () => {
    const myLoader = new RdfObjectLoader({ context });
    await myLoader.importArray(triples());
    const proxiedResource = RdfObjectProxy(myLoader.resources['http://example.org/myResource']);
    const hash: Record<string, boolean> = {};
    for (const predicate of proxiedResource?.predicates ?? []) {
      if (!hash[predicate.value]) {
        expect(predicate.value in proxiedResource).toEqual(true);
        delete proxiedResource[predicate.value];
        expect(predicate.value in proxiedResource).toEqual(false);
      }
      hash[predicate.value] = true;
    }
  });
});

// const myLoader = new RdfObjectLoader({ context });

// // Import triples
// const testData = myLoader.importArray();

//   .then(() => {
//     // Get property values by shortcut

//     const proxiedResource = RdfObjectProxyFactory(myLoader.resources['http://example.org/myResource']);

//     // console.log(proxiedResource)

//     for (const x of proxiedResource.label.label) {
//       console.log(`${x}`)
//     }

//     console.log(`URI:  ${proxiedResource}`);
//     console.log(`Type: ${proxiedResource.type}`);
//     // @ts-ignore
//     console.log(`Label: ${proxiedResource['rdfs:label']}`);
//     console.log(`Label (bis): ${proxiedResource.property['http://www.w3.org/1999/02/22-rdf-syntax-ns#label']}`);
//   });
