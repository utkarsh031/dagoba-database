const Dagoba = require('../../src/index.js');
const { createTestGraph, assertEqual, assertTruthy } = require('../testHelpers.js');

describe('Query', () => {
  let g;

  beforeEach(() => {
    g = createTestGraph();
  });

  describe('Query Building', () => {
    test('should create a query', () => {
      const q = g.v('thor');
      assertTruthy(q.program, 'Query should have a program');
      assertEqual(q.program.length, 1, 'Program should have 1 step');
    });

    test('should chain query methods', () => {
      const q = g.v('thor').out().property('name');
      assertEqual(q.program.length, 3, 'Program should have 3 steps');
    });

    test('should add steps correctly', () => {
      const q = g.v('thor').out('parent');
      assertEqual(q.program[0][0], 'vertex', 'First step should be vertex');
      assertEqual(q.program[1][0], 'out', 'Second step should be out');
    });
  });

  describe('Query Execution', () => {
    test('should execute simple query', () => {
      const result = g.v('thor').run();
      assertEqual(result.length, 1, 'Should return 1 result');
      assertEqual(result[0]._id, 'thor', 'Should return Thor');
    });

    test('should traverse edges', () => {
      const result = g.v('thor').out('parent').property('name').run();
      assertEqual(result.length, 2, 'Should return 2 parents');
      assertTruthy(result.includes('Odin'), 'Should include Odin');
      assertTruthy(result.includes('Frigg'), 'Should include Frigg');
    });

    test('should handle empty results', () => {
      const result = g.v('loki').out('parent').run();
      assertEqual(result.length, 0, 'Should return empty array');
    });
  });
});
