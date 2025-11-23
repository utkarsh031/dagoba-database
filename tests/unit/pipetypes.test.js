const Dagoba = require('../../src/index.js');
const { createTestGraph, assertEqual, assertTruthy, assertFalsy } = require('../testHelpers.js');

describe('Pipetypes', () => {
  let g;

  beforeEach(() => {
    g = createTestGraph();
  });

  describe('vertex', () => {
    test('should find vertex by ID', () => {
      const result = g.v('thor').run();
      assertEqual(result[0].name, 'Thor', 'Should find Thor');
    });

    test('should find multiple vertices', () => {
      const result = g.v('thor', 'odin').run();
      assertEqual(result.length, 2, 'Should find 2 vertices');
    });

    test('should find all vertices with no args', () => {
      const result = g.v().run();
      assertEqual(result.length, 5, 'Should find all 5 vertices');
    });
  });

  describe('out/in', () => {
    test('should traverse outgoing edges', () => {
      const result = g.v('thor').out().run();
      assertEqual(result.length, 2, 'Thor should have 2 parents');
    });

    test('should traverse incoming edges', () => {
      const result = g.v('odin').in().run();
      assertEqual(result.length, 2, 'Odin should have 2 children');
    });

    test('should filter by edge label', () => {
      const result = g.v('thor').out('parent').run();
      assertEqual(result.length, 2, 'Should filter by parent label');
    });
  });

  describe('property', () => {
    test('should extract property', () => {
      const result = g.v('thor').property('name').run();
      assertEqual(result[0], 'Thor', 'Should extract name property');
    });

    test('should filter null properties', () => {
      const result = g.v('thor').property('nonexistent').run();
      assertEqual(result.length, 0, 'Should filter out null properties');
    });
  });

  describe('unique', () => {
    test('should remove duplicates', () => {
      const result = g.v('thor', 'thor', 'odin').unique().run();
      assertEqual(result.length, 2, 'Should have 2 unique vertices');
    });

    test('should work with traversals', () => {
      const result = g.v('thor').out().in().unique().run();
      const uniqueIds = new Set(result.map(v => v._id));
      assertEqual(uniqueIds.size, result.length, 'All results should be unique');
    });
  });

  describe('filter', () => {
    test('should filter by function', () => {
      const result = g
        .v()
        .filter(v => v.age > 2000)
        .property('name')
        .run();
      assertTruthy(result.includes('Odin'), 'Should include Odin');
      assertTruthy(result.includes('Frigg'), 'Should include Frigg');
      assertEqual(result.length, 2, 'Should have 2 results');
    });

    test('should filter by object', () => {
      const result = g.v().filter({ name: 'Thor' }).run();
      assertEqual(result.length, 1, 'Should find 1 match');
      assertEqual(result[0].name, 'Thor', 'Should be Thor');
    });
  });

  describe('take', () => {
    test('should limit results', () => {
      const result = g.v().take(2).run();
      assertEqual(result.length, 2, 'Should return only 2 results');
    });

    test('should work with traversals', () => {
      // Thor has 2 parents, take(1) should return only 1
      const result = g.v('thor').out().take(1).run();
      assertEqual(result.length, 1, 'Should return only 1 result');
    });
  });

  describe('as/back/except', () => {
    test('should label and return to vertex', () => {
      const result = g.v('thor').as('start').out('parent').back('start').property('name').run();
      assertEqual(result[0], 'Thor', 'Should return to Thor');
    });

    test('should exclude labeled vertices', () => {
      const result = g
        .v('thor')
        .as('me')
        .out('parent')
        .in('parent')
        .except('me')
        .unique()
        .property('name')
        .run();
      assertFalsy(result.includes('Thor'), 'Should not include Thor');
      assertEqual(result.length, 1, 'Should have 1 sibling');
    });
  });

  describe('merge', () => {
    test('should merge multiple labeled vertices', () => {
      // Label Thor, then traverse to parent and label it
      // Then merge both labels to get both Thor and one parent
      const result = g
        .v('thor')
        .as('me')
        .out('parent')
        .as('parent')
        .merge('me', 'parent')
        .unique()
        .property('name')
        .run();

      assertEqual(result.length, 2, 'Should have Thor and one parent');
      assertTruthy(result.includes('Thor'), 'Should include Thor');
    });
  });

  describe('maxDepth', () => {
    test('should limit traversal depth', () => {
      const result = g.v('thor').out().maxDepth(1).run();
      // This limits how deep the gremlin can go
      assertTruthy(result.length > 0, 'Should have results');
    });
  });
});
