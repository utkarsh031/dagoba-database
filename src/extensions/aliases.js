

import { addTransformer } from '../core/transformers.js';
import { addPipetype } from '../core/pipetypes.js';
import { Query } from '../core/query.js';

function addAlias(newName, pipeline, defaults = []) {

  if (Array.isArray(pipeline) && Array.isArray(pipeline[0])) {
    addTransformer(function (program) {
      return program.flatMap(step => {
        if (step[0] !== newName) {
          return [step];
        }
        return pipeline;
      });
    }, 100);
  }

  else {
    addTransformer(function (program) {
      return program.map(step => {
        if (step[0] !== newName) {
          return step;
        }

        const args = step[1] && step[1].length > 0 ? step[1] : defaults;
        return [pipeline, args];
      });
    }, 100);
  }

  addPipetype(newName, function () {});

  Query[newName] = function (...args) {
    return this.add(newName, args);
  };
}

function registerCommonAliases() {
  addAlias('parents', 'out', ['parent']);
  addAlias('children', 'in', ['parent']);
  addAlias('siblings', 'out', ['sibling']);
  addAlias('spouse', 'out', ['spouse']);
}

export { addAlias, registerCommonAliases };
