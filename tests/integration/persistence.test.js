const Dagoba = require('../../src/index.js');
const { assertEqual } = require('../testHelpers.js');

// Mock localStorage for Node.js environment
global.localStorage = {
  store: {},
  getItem(key) {
    return this.store[key] || null;
  },
  setItem(key, value) {
    this.store[key] = value.toString();
  },
  removeItem(key) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  }
};

describe('Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Serialization', () => {
    test('should convert graph to string', () => {
      const g = Dagoba.graph();
      g.addVertex({ _id: 'a', name: 'A' });
      g.addVertex({ _id: 'b', name: 'B' });
      g.addEdge({ _out: 'a', _in: 'b', _label: 'test' });

      const str = g.toString();
      assertTruthy(str.includes('"V"'), 'Should include vertices');
      assertTruthy(str.includes('"E"'), 'Should include edges');
    });

    test('should handle circular references', () => {
      const g = Dagoba.graph();
      g.addVertex({ _id: 'a' });
      g.addVertex({ _id: 'b' });
      g.addEdge({ _out: 'a', _in: 'b', _label: 'test' });

      // This should not throw
      const str = g.toString();
      assertTruthy(str.length > 0, 'Should produce string');
    });
  });

  describe('Deserialization', () => {
    test('should restore graph from string', () => {
      const g1 = Dagoba.graph();
      g1.addVertex({ _id: 'a', name: 'A' });
      g1.addVertex({ _id: 'b', name: 'B' });
      g1.addEdge({ _out: 'a', _in: 'b', _label: 'test' });

      const str = g1.toString();
      const g2 = Dagoba.fromString(str);

      assertEqual(g2.vertices.length, 2, 'Should restore vertices');
      assertEqual(g2.edges.length, 1, 'Should restore edges');
    });

    test('should restore vertex properties', () => {
      const g1 = Dagoba.graph();
      g1.addVertex({ _id: 'test', name: 'Test', value: 42 });

      const g2 = Dagoba.fromString(g1.toString());
      const vertex = g2.findVertexById('test');

      assertEqual(vertex.name, 'Test', 'Should restore name');
      assertEqual(vertex.value, 42, 'Should restore value');
    });
  });

  describe('localStorage Persistence', () => {
    test('should save graph to localStorage', () => {
      const g = Dagoba.graph();
      g.addVertex({ _id: 'test', name: 'Test' });

      Dagoba.persist(g, 'testGraph');

      const stored = localStorage.getItem('DAGOBA::testGraph');
      assertTruthy(stored !== null, 'Should store in localStorage');
    });

    test('should load graph from localStorage', () => {
      const g1 = Dagoba.graph();
      g1.addVertex({ _id: 'test', name: 'Test' });
      g1.addVertex({ _id: 'test2', name: 'Test2' });

      Dagoba.persist(g1, 'testGraph');
      const g2 = Dagoba.depersist('testGraph');

      assertEqual(g2.vertices.length, 2, 'Should load vertices');
      assertEqual(g2.findVertexById('test').name, 'Test', 'Should load properties');
    });

    test('should handle default graph name', () => {
      const g = Dagoba.graph();
      g.addVertex({ _id: 'test' });

      Dagoba.persist(g);
      const g2 = Dagoba.depersist();

      assertEqual(g2.vertices.length, 1, 'Should use default name');
    });
  });

  describe('Round-trip Testing', () => {
    test('should maintain graph integrity through save/load', () => {
      const g1 = Dagoba.graph();

      // Create complex graph
      g1.addVertices([
        { _id: 'a', name: 'A', value: 1 },
        { _id: 'b', name: 'B', value: 2 },
        { _id: 'c', name: 'C', value: 3 }
      ]);

      g1.addEdges([
        { _out: 'a', _in: 'b', _label: 'edge1' },
        { _out: 'b', _in: 'c', _label: 'edge2' }
      ]);

      // Save and load
      Dagoba.persist(g1, 'roundTrip');
      const g2 = Dagoba.depersist('roundTrip');

      // Test queries work the same
      const result1 = g1.v('a').out().out().property('name').run();
      const result2 = g2.v('a').out().out().property('name').run();

      assertEqual(result1[0], result2[0], 'Queries should produce same results');
    });
  });
});
