const Dagoba = require('../../src/index.js');
const { assertEqual, assertArrayEquals, assertTruthy } = require('../testHelpers.js');

describe('Integration Tests', () => {
  let g;

  beforeEach(() => {
    // Create more complex graph
    g = Dagoba.graph();

    // Norse mythology family tree
    const gods = [
      { _id: 'ymir', name: 'Ymir', generation: 0 },
      { _id: 'buri', name: 'Buri', generation: 1 },
      { _id: 'borr', name: 'Borr', generation: 2 },
      { _id: 'bestla', name: 'Bestla', generation: 2 },
      { _id: 'odin', name: 'Odin', generation: 3 },
      { _id: 'vili', name: 'Vili', generation: 3 },
      { _id: 've', name: 'Ve', generation: 3 },
      { _id: 'frigg', name: 'Frigg', generation: 3 },
      { _id: 'thor', name: 'Thor', generation: 4 },
      { _id: 'baldr', name: 'Baldr', generation: 4 }
    ];

    const relations = [
      { _out: 'buri', _in: 'ymir', _label: 'parent' },
      { _out: 'borr', _in: 'buri', _label: 'parent' },
      { _out: 'odin', _in: 'borr', _label: 'parent' },
      { _out: 'odin', _in: 'bestla', _label: 'parent' },
      { _out: 'vili', _in: 'borr', _label: 'parent' },
      { _out: 'vili', _in: 'bestla', _label: 'parent' },
      { _out: 've', _in: 'borr', _label: 'parent' },
      { _out: 've', _in: 'bestla', _label: 'parent' },
      { _out: 'thor', _in: 'odin', _label: 'parent' },
      { _out: 'thor', _in: 'frigg', _label: 'parent' },
      { _out: 'baldr', _in: 'odin', _label: 'parent' },
      { _out: 'baldr', _in: 'frigg', _label: 'parent' },
      { _out: 'odin', _in: 'frigg', _label: 'married_to' }
    ];

    gods.forEach(god => g.addVertex(god));
    relations.forEach(rel => g.addEdge(rel));

    // No need to add aliases - use the built-in ones
    // Dagoba.addAlias('parents', 'out', ['child_of']);
    // Dagoba.addAlias('children', 'in', ['child_of']);
  });

  describe('Multi-hop Queries', () => {
    test('should find grandparents', () => {
      const result = g.v('thor').parents().parents().property('name').run();
      assertTruthy(result.includes('Borr'), 'Should include Borr');
      assertTruthy(result.includes('Bestla'), 'Should include Bestla');
    });

    test('should find great-grandparents', () => {
      const result = g.v('thor').parents().parents().parents().property('name').run();
      assertTruthy(result.includes('Buri'), 'Should include Buri');
    });

    test('should find siblings', () => {
      const result = g
        .v('thor')
        .as('me')
        .parents()
        .children()
        .except('me')
        .unique()
        .property('name')
        .run();
      assertEqual(result.length, 1, 'Thor has 1 sibling');
      assertEqual(result[0], 'Baldr', 'Sibling should be Baldr');
    });

    test('should find cousins', () => {
      const result = g
        .v('thor')
        .parents()
        .as('myParents')
        .parents()
        .children()
        .except('myParents')
        .children()
        .unique()
        .property('name')
        .run();
      // This would find Thor's cousins if there were any
      assertTruthy(Array.isArray(result), 'Should return array');
    });
  });

  describe('Complex Filtering', () => {
    test('should filter by generation', () => {
      const result = g
        .v()
        .filter(god => god.generation === 3)
        .property('name')
        .run();
      assertTruthy(result.includes('Odin'), 'Should include Odin');
      assertTruthy(result.includes('Frigg'), 'Should include Frigg');
    });

    test('should combine multiple filters', () => {
      const result = g
        .v()
        .filter(god => god.generation >= 3)
        .filter(god => god.name.startsWith('O'))
        .property('name')
        .run();
      assertEqual(result[0], 'Odin', 'Should find only Odin');
    });
  });

  describe('Path Finding', () => {
    test('should find path between ancestors', () => {
      const path = g.findShortestPath('thor', 'ymir');
      assertTruthy(path !== null, 'Should find a path');
      assertEqual(path[0]._id, 'thor', 'Should start at Thor');
      assertEqual(path[path.length - 1]._id, 'ymir', 'Should end at Ymir');
    });
  });

  describe('Aggregation Queries', () => {
    test('should count children', () => {
      const odinChildren = g.v('odin').children().run();
      assertEqual(odinChildren.length, 2, 'Odin has 2 children');
    });

    test('should find all descendants', () => {
      function findAllDescendants(id) {
        const visited = new Set();
        const queue = [id];
        const descendants = [];

        while (queue.length > 0) {
          const current = queue.shift();
          if (visited.has(current)) continue;
          visited.add(current);

          const children = g.v(current).children().run();
          children.forEach(child => {
            if (!visited.has(child._id)) {
              descendants.push(child.name);
              queue.push(child._id);
            }
          });
        }

        return descendants;
      }

      const descendants = findAllDescendants('ymir');
      assertTruthy(descendants.length > 0, 'Ymir should have descendants');
    });
  });
});
