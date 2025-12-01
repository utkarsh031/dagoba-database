/**
Dagoba - In-Memory Graph Database
Main entry point
**/

import { createGraph, Graph, setGraphDependencies } from './core/graph.js';
import { createQuery, Query, setQueryDependencies } from './core/query.js';
import { addPipetype, getPipetype, Pipetypes } from './core/pipetypes.js';
import { addTransformer, transform, Transformers } from './core/transformers.js';
import { addAlias, registerCommonAliases } from './extensions/aliases.js';
import { persist, depersist, fromString } from './utils/persistence.js';
import { error, jsonify, objectFilter } from './core/helpers.js';

// Inject dependencies into modules
setGraphDependencies({ error, objectFilter, jsonify, createQuery });
setQueryDependencies({ getPipetype, transform });

// Register common aliases
registerCommonAliases();

// Add pipetype methods to Query prototype
Object.keys(Pipetypes).forEach(name => {
  Query[name] = function (...args) {
    return this.add(name, args);
  };
});

// Create the Dagoba namespace (matching your original structure)
const Dagoba = {
  // Factories
  graph: createGraph,
  query: createQuery,

  // Prototypes
  G: Graph,
  Q: Query,

  // Pipetypes
  Pipetypes: Pipetypes,
  addPipetype,
  getPipetype,

  // Transformers
  T: Transformers,
  addTransformer,
  transform,

  // Aliases
  addAlias,

  // Persistence
  persist,
  depersist,
  fromString,

  // Version
  version: '1.0.0'
};

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Dagoba;
}

if (typeof window !== 'undefined') {
  window.Dagoba = Dagoba;
}

export default Dagoba;
