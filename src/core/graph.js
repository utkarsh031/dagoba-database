

const Graph = {

  addVertices(vs) {
    vs.forEach(v => this.addVertex(v));
  },

  addEdges(es) {
    es.forEach(e => this.addEdge(e));
  },

  addVertex(vertex) {
    if (vertex._id == null) {
      vertex._id = this.autoId++;
    } else if (this.findVertexById(vertex._id)) {
      return error('A vertex with that ID already exists!');
    }

    this.vertices.push(vertex);
    this.vertexIndex[vertex._id] = vertex;
    vertex._out = [];
    vertex._in = [];

    return vertex._id;
  },

  addEdge(edge) {
    edge._in = this.findVertexById(edge._in);
    edge._out = this.findVertexById(edge._out);

    if (!(edge._in && edge._out)) {

      return error("That edge's " + (edge._in ? 'out' : 'in') + " vertex wasn't found");
    }

    edge._out._out.push(edge);
    edge._in._in.push(edge);

    this.edges.push(edge);

    this.inEdgeIndex = this.inEdgeIndex || {};
    this.outEdgeIndex = this.outEdgeIndex || {};

    this.inEdgeIndex[edge._in._id] = this.inEdgeIndex[edge._in._id] || [];
    this.inEdgeIndex[edge._in._id].push(edge);

    this.outEdgeIndex[edge._out._id] = this.outEdgeIndex[edge._out._id] || [];
    this.outEdgeIndex[edge._out._id].push(edge);
  },

  findInEdges(vertex) {
    return vertex._in;
  },

  findOutEdges(vertex) {
    return vertex._out;
  },

  findVertexById(id) {
    return this.vertexIndex[id];
  },

  findVertices(args) {
    if (typeof args[0] === 'object') {
      return this.searchVertices(args[0]);
    }

    if (args.length === 0) {
      return this.vertices.slice();
    }

    return this.findVerticesByIds(args);
  },

  findVerticesByIds(ids) {
    if (ids.length === 1) {
      const vertex = this.findVertexById(ids[0]);
      return vertex ? [vertex] : [];
    }

    return ids.map(id => this.findVertexById(id)).filter(Boolean);
  },

  searchVertices(filter) {
    return this.vertices.filter(vertex => {
      return objectFilter(vertex, filter);
    });
  },

  v(...args) {
    const query = createQuery(this);
    query.add('vertex', args);
    return query;
  },

  findShortestPath(fromId, toId) {
    const queue = [{ vertex: this.findVertexById(fromId), path: [] }];
    const visited = new Set();

    while (queue.length > 0) {
      const { vertex, path } = queue.shift();

      if (vertex._id === toId) {
        return path.concat(vertex);
      }

      if (visited.has(vertex._id)) continue;
      visited.add(vertex._id);

      for (const edge of vertex._out) {
        queue.push({
          vertex: edge._in,
          path: path.concat(vertex)
        });
      }
    }

    return null;
  },

  toString() {
    return jsonify(this);
  }
};

function createGraph(V, E) {
  const graph = Object.create(Graph);

  graph.edges = [];
  graph.vertices = [];
  graph.vertexIndex = {};
  graph.autoId = 1;

  graph.inEdgeIndex = {};
  graph.outEdgeIndex = {};

  if (Array.isArray(V)) graph.addVertices(V);
  if (Array.isArray(E)) graph.addEdges(E);

  return graph;
}

let error, objectFilter, jsonify, createQuery;

function setGraphDependencies(deps) {
  error = deps.error;
  objectFilter = deps.objectFilter;
  jsonify = deps.jsonify;
  createQuery = deps.createQuery;
}

export { createGraph, Graph, setGraphDependencies };
