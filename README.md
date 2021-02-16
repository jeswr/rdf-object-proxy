# rdf-object-proxy
A proxy for the rdf-object library to match the LDflex API

[![GitHub license](https://img.shields.io/github/license/jeswr/rdf-object-proxy.svg)](https://github.com/jeswr/rdf-object-proxy/blob/master/LICENSE)
[![npm version](https://img.shields.io/npm/v/rdf-object-proxy.svg)](https://www.npmjs.com/package/rdf-object-proxy)
[![build](https://img.shields.io/github/workflow/status/jeswr/rdf-object-proxy/Node.js%20CI)](https://github.com/jeswr/rdf-object-proxy/tree/main/)
[![Dependabot](https://badgen.net/badge/Dependabot/enabled/green?icon=dependabot)](https://dependabot.com/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

## Usage

```ts
import { RdfObjectProxy } from 'rdf-object-proxy';
import { RdfObjectLoader } from 'rdf-object';

const context = {
  "@context": {
    "@vocab": "http://www.w3.org/ns/shacl#",
    rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    sh$property: "property",
    mf: "http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#",
    include: "mf:include",
    entries: "mf:entries",
  },
};

(async () => {
  const loader = new RdfObjectLoader({ context });
  await loader.importArray(quads /* array of rdf-js compliant quads */);
  const resource =
    loader.resources['http://example.org/Jesse'];
  return RdfObjectProxy(resource);
})();
```

## License
©2021–present
[Jesse Wright](https://github.com/jeswr).
[MIT License](https://github.com/jeswr/useState/blob/master/LICENSE).
