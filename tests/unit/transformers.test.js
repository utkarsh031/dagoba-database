const Dagoba = require('../../src/index.js');
const { assertEqual, assertTruthy } = require('../testHelpers.js');

describe('Transformers', () => {
  describe('Transformer Registration', () => {
    test('should register transformer', () => {
      const initialLength = Dagoba.T.length;
      Dagoba.addTransformer(program => program, 50);
      assertEqual(Dagoba.T.length, initialLength + 1, 'Should add transformer');
    });

    test('should sort transformers by priority', () => {
      const high = jest.fn(p => p);
      const low = jest.fn(p => p);

      Dagoba.addTransformer(low, 10);
      Dagoba.addTransformer(high, 100);

      const highIndex = Dagoba.T.findIndex(t => t.fun === high);
      const lowIndex = Dagoba.T.findIndex(t => t.fun === low);

      assertTruthy(highIndex < lowIndex, 'Higher priority should come first');
    });
  });

  describe('Transform Execution', () => {
    test('should transform program', () => {
      const program = [
        ['step1', []],
        ['step2', []]
      ];
      const result = Dagoba.transform(program);
      assertTruthy(Array.isArray(result), 'Should return array');
    });

    test('should apply transformers in order', () => {
      const calls = [];

      Dagoba.addTransformer(program => {
        calls.push('first');
        return program;
      }, 100);

      Dagoba.addTransformer(program => {
        calls.push('second');
        return program;
      }, 50);

      Dagoba.transform([['test', []]]);

      assertEqual(calls[0], 'first', 'High priority should run first');
      assertEqual(calls[1], 'second', 'Low priority should run second');
    });
  });
});
