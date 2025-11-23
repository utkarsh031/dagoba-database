function createTestGraph() {
  const Dagoba = require('../src/index.js');
  const g = Dagoba.graph();

  // Simple family tree
  const vertices = [
    { _id: 'thor', name: 'Thor', age: 1500 },
    { _id: 'odin', name: 'Odin', age: 5000 },
    { _id: 'frigg', name: 'Frigg', age: 4800 },
    { _id: 'baldr', name: 'Baldr', age: 1200 },
    { _id: 'loki', name: 'Loki', age: 1400 }
  ];

  const edges = [
    { _out: 'thor', _in: 'odin', _label: 'parent' },
    { _out: 'thor', _in: 'frigg', _label: 'parent' },
    { _out: 'baldr', _in: 'odin', _label: 'parent' },
    { _out: 'baldr', _in: 'frigg', _label: 'parent' }
  ];

  vertices.forEach(v => g.addVertex(v));
  edges.forEach(e => g.addEdge(e));

  return g;
}

function assertEqual(actual, expected, message) {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);

  if (actualStr !== expectedStr) {
    throw new Error(`${message}\nExpected: ${expectedStr}\nActual: ${actualStr}`);
  }
}

function assertArrayEquals(actual, expected, message) {
  if (actual.length !== expected.length) {
    throw new Error(
      `${message}\nLength mismatch. Expected ${expected.length}, got ${actual.length}`
    );
  }

  for (let i = 0; i < actual.length; i++) {
    if (actual[i] !== expected[i]) {
      throw new Error(
        `${message}\nMismatch at index ${i}. Expected ${expected[i]}, got ${actual[i]}`
      );
    }
  }
}

function assertTruthy(value, message) {
  if (!value) {
    throw new Error(message);
  }
}

function assertFalsy(value, message) {
  if (value) {
    throw new Error(message);
  }
}

module.exports = {
  createTestGraph,
  assertEqual,
  assertArrayEquals,
  assertTruthy,
  assertFalsy
};

// Also expose as globals for tests that expect them without importing
global.createTestGraph = createTestGraph;
global.assertEqual = assertEqual;
global.assertArrayEquals = assertArrayEquals;
global.assertTruthy = assertTruthy;
global.assertFalsy = assertFalsy;
