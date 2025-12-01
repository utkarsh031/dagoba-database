

import { createGraph, Graph, setGraphDependencies } from './core/graph.js';
import { createQuery, Query, setQueryDependencies } from './core/query.js';
import { addPipetype, getPipetype, Pipetypes } from './core/pipetypes.js';
import { addTransformer, transform, Transformers } from './core/transformers.js';
import { addAlias, registerCommonAliases } from './extensions/aliases.js';
import { persist, depersist, fromString } from './utils/persistence.js';
import { error, jsonify, objectFilter } from './core/helpers.js';

setGraphDependencies({ error, objectFilter, jsonify, createQuery });
setQueryDependencies({ getPipetype, transform });

registerCommonAliases();

Object.keys(Pipetypes).forEach(name => {
  Query[name] = function (...args) {
    return this.add(name, args);
  };
});

const Dagoba = {

  graph: createGraph,
  query: createQuery,

  G: Graph,
  Q: Query,

  Pipetypes: Pipetypes,
  addPipetype,
  getPipetype,

  T: Transformers,
  addTransformer,
  transform,

  addAlias,

  persist,
  depersist,
  fromString,

  version: '1.0.0'
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Dagoba;
}

if (typeof window !== 'undefined') {
  window.Dagoba = Dagoba;
}

export default Dagoba;
