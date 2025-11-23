// Graph Unit Tests
// ============================================

const Dagoba = require('../../src/index.js');
const { assertEqual, assertTruthy, assertFalsy } = require('../testHelpers.js');

describe('Graph', () => {
  let g;

  beforeEach(() => {
    g = Dagoba.graph();
  });

  describe('Vertex Operations', () => {
    test('should add a vertex', () => {
      const id = g.addVertex({ _id: 'test', name: 'Test' });
      assertEqual(id, 'test', 'Vertex ID should match');
      assertEqual(g.vertices.length, 1, 'Should have 1 vertex');
    });

    test('should auto-generate vertex ID', () => {
      const id = g.addVertex({ name: 'Auto' });
      assertTruthy(id, 'Should have an ID');
      assertEqual(g.vertices.length, 1, 'Should have 1 vertex');
    });

    test('should reject duplicate vertex IDs', () => {
      g.addVertex({ _id: 'test', name: 'First' });
      const result = g.addVertex({ _id: 'test', name: 'Second' });
      assertFalsy(result, 'Should reject duplicate ID');
      assertEqual(g.vertices.length, 1, 'Should still have 1 vertex');
    });

    test('should add multiple vertices', () => {
      g.addVertices([
        { _id: 'a', name: 'A' },
        { _id: 'b', name: 'B' },
        { _id: 'c', name: 'C' }
      ]);
      assertEqual(g.vertices.length, 3, 'Should have 3 vertices');
    });

    test('should initialize vertex edge lists', () => {
      g.addVertex({ _id: 'test' });
      const vertex = g.findVertexById('test');
      assertTruthy(Array.isArray(vertex._in), '_in should be an array');
      assertTruthy(Array.isArray(vertex._out), '_out should be an array');
    });
  });

  describe('Edge Operations', () => {
    beforeEach(() => {
      g.addVertex({ _id: 'a' });
      g.addVertex({ _id: 'b' });
    });

    test('should add an edge', () => {
      g.addEdge({ _out: 'a', _in: 'b', _label: 'test' });
      assertEqual(g.edges.length, 1, 'Should have 1 edge');
    });

    test('should link edge to vertices', () => {
      g.addEdge({ _out: 'a', _in: 'b', _label: 'test' });
      const vertexA = g.findVertexById('a');
      const vertexB = g.findVertexById('b');

      assertEqual(vertexA._out.length, 1, 'Vertex A should have 1 outgoing edge');
      assertEqual(vertexB._in.length, 1, 'Vertex B should have 1 incoming edge');
    });

    test('should reject edge with missing vertex', () => {
      const result = g.addEdge({ _out: 'a', _in: 'nonexistent', _label: 'test' });
      assertFalsy(result, 'Should reject edge with missing vertex');
      assertEqual(g.edges.length, 0, 'Should have no edges');
    });

    test('should add multiple edges', () => {
      g.addVertex({ _id: 'c' });
      g.addEdges([
        { _out: 'a', _in: 'b', _label: 'test1' },
        { _out: 'b', _in: 'c', _label: 'test2' }
      ]);
      assertEqual(g.edges.length, 2, 'Should have 2 edges');
    });
  });

  describe('Find Operations', () => {
    beforeEach(() => {
      g.addVertices([
        { _id: 'a', type: 'x', value: 1 },
        { _id: 'b', type: 'y', value: 2 },
        { _id: 'c', type: 'x', value: 3 }
      ]);
    });

    test('should find vertex by ID', () => {
      const vertex = g.findVertexById('b');
      assertEqual(vertex.type, 'y', 'Should find correct vertex');
    });

    test('should find vertices by IDs', () => {
      const vertices = g.findVerticesByIds(['a', 'c']);
      assertEqual(vertices.length, 2, 'Should find 2 vertices');
    });

    test('should search vertices by properties', () => {
      const vertices = g.searchVertices({ type: 'x' });
      assertEqual(vertices.length, 2, 'Should find 2 vertices with type x');
    });

    test('should return all vertices when no args', () => {
      const vertices = g.findVertices([]);
      assertEqual(vertices.length, 3, 'Should return all vertices');
    });
  });

  describe('Shortest Path', () => {
    beforeEach(() => {
      g.addVertices([{ _id: 'a' }, { _id: 'b' }, { _id: 'c' }, { _id: 'd' }]);
      g.addEdges([
        { _out: 'a', _in: 'b', _label: 'edge' },
        { _out: 'b', _in: 'c', _label: 'edge' },
        { _out: 'c', _in: 'd', _label: 'edge' }
      ]);
    });

    test('should find shortest path', () => {
      const path = g.findShortestPath('a', 'd');
      assertEqual(path.length, 4, 'Path should have 4 vertices');
      assertEqual(path[0]._id, 'a', 'Should start at a');
      assertEqual(path[3]._id, 'd', 'Should end at d');
    });

    test('should return null for disconnected vertices', () => {
      g.addVertex({ _id: 'e' });
      const path = g.findShortestPath('a', 'e');
      assertEqual(path, null, 'Should return null for no path');
    });
  });
});
