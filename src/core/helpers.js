

function error(msg) {
  console.error(msg);
  return false;
}

function makeGremlin(vertex, state) {
  return {
    vertex: vertex,
    state: state || {}
  };
}

function goToVertex(gremlin, vertex) {
  return makeGremlin(vertex, gremlin.state);
}

function objectFilter(thing, filter) {
  for (const key in filter) {
    if (thing[key] !== filter[key]) {
      return false;
    }
  }
  return true;
}

function filterEdges(filter) {
  return function (edge) {
    if (!filter) return true;

    if (typeof filter === 'string') {
      return edge._label === filter;
    }

    if (Array.isArray(filter)) {
      return filter.includes(edge._label);
    }

    return objectFilter(edge, filter);
  };
}

function extend(list, defaults) {
  return Object.keys(defaults).reduce((acc, key) => {
    if (typeof list[key] !== 'undefined') return acc;
    acc[key] = defaults[key];
    return acc;
  }, list);
}

function cleanVertex(key, value) {
  if (key === '_in' || key === '_out') {
    return undefined;
  }
  return value;
}

function cleanEdge(key, value) {
  if (key === '_in' || key === '_out') {
    return value._id;
  }
  return value;
}

function jsonify(graph) {
  return (
    '{"V":' +
    JSON.stringify(graph.vertices, cleanVertex) +
    ',"E":' +
    JSON.stringify(graph.edges, cleanEdge) +
    '}'
  );
}

export {
  error,
  makeGremlin,
  goToVertex,
  objectFilter,
  filterEdges,
  extend,
  cleanVertex,
  cleanEdge,
  jsonify
};
