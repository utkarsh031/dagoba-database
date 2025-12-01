///Pipetypes - All query operations

import { makeGremlin, goToVertex, objectFilter, filterEdges, error } from './helpers.js';

const Pipetypes = {};

///Add a pipetype
function addPipetype(name, handler) {
  Pipetypes[name] = handler;

  return function (...args) {
    return this.add(name, args);
  };
}

///Get a pipetype by name
function getPipetype(name) {
  const pipetype = Pipetypes[name];

  if (!pipetype) {
    error('Unrecognized pipetype: ' + name);
  }

  return pipetype || fauxPipetype;
}

///Default pipetype (pass-through)
function fauxPipetype(_, __, maybeGremlin) {
  return maybeGremlin || 'pull';
}

///Simple traversal helper (for in/out)
function simpleTraversal(dir) {
  const findMethod = dir === 'out' ? 'findOutEdges' : 'findInEdges';
  const edgeList = dir === 'out' ? '_in' : '_out';

  return function (graph, args, gremlin, state) {
    if (!gremlin && (!state.edges || !state.edges.length)) {
      return 'pull';
    }

    if (!state.edges || !state.edges.length) {
      state.gremlin = gremlin;
      state.edges = graph[findMethod](gremlin.vertex).filter(filterEdges(args[0]));
    }

    if (!state.edges.length) {
      return 'pull';
    }

    const vertex = state.edges.pop()[edgeList];
    return goToVertex(state.gremlin, vertex);
  };
}

///Register all pipetypes

///Vertex pipetype - starts query at vertices
addPipetype('vertex', function (graph, args, maybeGremlin, state) {
  if (!state.vertices) {
    state.vertices = graph.findVertices(args);
  }

  if (!state.vertices.length) {
    return 'done';
  }

  const vertex = state.vertices.pop();
  return makeGremlin(vertex, maybeGremlin && maybeGremlin.state);
});

///Out pipetype - traverse outgoing edges
addPipetype('out', simpleTraversal('out'));

///In pipetype - traverse incoming edges
addPipetype('in', simpleTraversal('in'));

///Property pipetype - extract property from vertex
addPipetype('property', function (graph, args, gremlin, state) {
  if (!gremlin) return 'pull';

  gremlin.result = gremlin.vertex[args[0]];
  return gremlin.result == null ? false : gremlin;
});

///Unique pipetype - filter out duplicate vertices
addPipetype('unique', function (graph, args, gremlin, state) {
  if (!gremlin) return 'pull';

  if (state[gremlin.vertex._id]) return 'pull';

  state[gremlin.vertex._id] = true;

  return gremlin;
});

///Filter pipetype - filter gremlins by criteria
addPipetype('filter', function (graph, args, gremlin, state) {
  if (!gremlin) return 'pull';

  if (typeof args[0] === 'object') {
    return objectFilter(gremlin.vertex, args[0]) ? gremlin : 'pull';
  }

  if (typeof args[0] !== 'function') {
    error('Filter is not a function: ' + args[0]);
    return gremlin;
  }

  if (!args[0](gremlin.vertex, gremlin)) {
    return 'pull';
  }

  return gremlin;
});

///Take pipetype - limit number of results
addPipetype('take', function (graph, args, gremlin, state) {
  state.taken = state.taken || 0;

  if (!gremlin) return 'pull';

  if (state.taken < args[0]) {
    state.taken++;
    return gremlin;
  }

  state.taken = 0;
  return 'done';
});

///As pipetype - label current vertex
addPipetype('as', function (graph, args, gremlin, state) {
  if (!gremlin) return 'pull';

  gremlin.state.as = gremlin.state.as || {};
  gremlin.state.as[args[0]] = gremlin.vertex;

  return gremlin;
});

///Back pipetype - jump to labeled vertex
addPipetype('back', function (graph, args, gremlin, state) {
  if (!gremlin) return 'pull';

  return goToVertex(gremlin, gremlin.state.as[args[0]]);
});

///Except pipetype - filter out labeled vertex
addPipetype('except', function (graph, args, gremlin, state) {
  if (!gremlin) return 'pull';

  if (gremlin.vertex === gremlin.state.as[args[0]]) {
    return 'pull';
  }

  return gremlin;
});

///Merge pipetype - collect multiple labeled vertices
addPipetype('merge', function (graph, args, gremlin, state) {
  if (!gremlin) return 'pull';

  if (!state.vertices || !state.vertices.length) {
    const obj = (gremlin.state || {}).as || {};
    state.vertices = args.map(id => obj[id]).filter(Boolean);
  }

  if (!state.vertices.length) return 'pull';

  const vertex = state.vertices.pop();
  return makeGremlin(vertex, gremlin.state);
});

///MaxDepth pipetype - limit traversal depth
addPipetype('maxDepth', function (graph, args, gremlin, state) {
  if (!gremlin) return 'pull';

  gremlin.state.depth = (gremlin.state.depth || 0) + 1;

  if (gremlin.state.depth > args[0]) return 'pull';

  return gremlin;
});

export { Pipetypes, addPipetype, getPipetype, fauxPipetype, simpleTraversal };
