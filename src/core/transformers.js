

import { error, extend } from './helpers.js';

const Transformers = [];

function addTransformer(fun, priority) {
  if (typeof fun !== 'function') {
    return error('Invalid transformer function');
  }

  let i = 0;
  for (i = 0; i < Transformers.length; i++) {

    if (priority > Transformers[i].priority) break;
  }

  Transformers.splice(i, 0, { priority: priority, fun: fun });
}

function transform(program) {
  return Transformers.reduce((acc, transformer) => {
    let result = transformer.fun(acc);
    let iterations = 0;
    const maxIterations = 100;

    while (JSON.stringify(result) !== JSON.stringify(acc) && iterations < maxIterations) {
      acc = result;
      result = transformer.fun(acc);
      iterations++;
    }

    if (iterations >= maxIterations) {
      error('Transformer exceeded maximum iterations - possible infinite loop');
    }

    return result;
  }, program);
}

addTransformer(function (program) {
  for (let i = program.length - 1; i > 0; i--) {
    const step = program[i];
    const prev = program[i - 1];

    if (step[0] === 'filter' && prev[0] === 'out') {
      program[i] = prev;
      program[i - 1] = step;
    }
  }

  return program;
}, 50);

export { Transformers, addTransformer, transform };
