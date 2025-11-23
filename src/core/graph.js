///Main graph structure and methods

const Graph = {
  ///Add multiple vertices
  addVertices(vs) {
    vs.forEach(v => this.addVertex(v));
  },

  ///Add multiple edges
  addEdges(es) {
    es.forEach(e => this.addEdge(e));
  },

  ///Add a single vertex to the graph
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

  ///Add a single edge
  addEdge(edge) {
    edge._in = this.findVertexById(edge._in);
    edge._out = this.findVertexById(edge._out);

    if (!(edge._in && edge._out)) {
      // Fixed the typo here
      return error("That edge's " + (edge._in ? 'out' : 'in') + " vertex wasn't found");
    }

    edge._out._out.push(edge);
    edge._in._in.push(edge);

    this.edges.push(edge);

    // Index edges
    this.inEdgeIndex = this.inEdgeIndex || {};
    this.outEdgeIndex = this.outEdgeIndex || {};

    this.inEdgeIndex[edge._in._id] = this.inEdgeIndex[edge._in._id] || [];
    this.inEdgeIndex[edge._in._id].push(edge);

    this.outEdgeIndex[edge._out._id] = this.outEdgeIndex[edge._out._id] || [];
    this.outEdgeIndex[edge._out._id].push(edge);
  },

  ///Find incoming edges for a vertex
  findInEdges(vertex) {
    return vertex._in;
  },

  ///Find outgoing edges for a vertex
  findOutEdges(vertex) {
    return vertex._out;
  },

  ///Find vertex by ID
  findVertexById(id) {
    return this.vertexIndex[id];
  },

  ///Find vertices matching criteria
  findVertices(args) {
    if (typeof args[0] === 'object') {
      return this.searchVertices(args[0]);
    }

    if (args.length === 0) {
      return this.vertices.slice();
    }

    return this.findVerticesByIds(args);
  },

  ///Find vertices by IDs
  findVerticesByIds(ids) {
    if (ids.length === 1) {
      const vertex = this.findVertexById(ids[0]);
      return vertex ? [vertex] : [];
    }

    return ids.map(id => this.findVertexById(id)).filter(Boolean);
  },

  ///Search vertices by properties
  searchVertices(filter) {
    return this.vertices.filter(vertex => {
      return objectFilter(vertex, filter);
    });
  },

  ///Query initializer - starts a query from this graph
  v(...args) {
    const query = createQuery(this);
    query.add('vertex', args);
    return query;
  },

  ///Find shortest path between two vertices (BFS)
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

  ///Convert graph to string for persistence
  toString() {
    return jsonify(this);
  }
};

///Factory function to create graphs
function createGraph(V, E) {
  const graph = Object.create(Graph);

  graph.edges = [];
  graph.vertices = [];
  graph.vertexIndex = {};
  graph.autoId = 1;

  ///Initialize edge indices
  graph.inEdgeIndex = {};
  graph.outEdgeIndex = {};

  if (Array.isArray(V)) graph.addVertices(V);
  if (Array.isArray(E)) graph.addEdges(E);

  return graph;
}

///Helper imports
let error, objectFilter, jsonify, createQuery;

///Setter function to inject dependencies
function setGraphDependencies(deps) {
  error = deps.error;
  objectFilter = deps.objectFilter;
  jsonify = deps.jsonify;
  createQuery = deps.createQuery;
}

export { createGraph, Graph, setGraphDependencies };
