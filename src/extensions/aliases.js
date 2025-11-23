///Alias system for creating shorthand query methods

import { addTransformer } from '../core/transformers.js';
import { addPipetype } from '../core/pipetypes.js';
import { Query } from '../core/query.js';

///Add an alias
function addAlias(newName, pipeline, defaults = []) {
  // Multi-step alias
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
  // Simple alias
  else {
    addTransformer(function (program) {
      return program.map(step => {
        if (step[0] !== newName) {
          return step;
        }
        // If step has args, use them; otherwise use defaults
        const args = step[1] && step[1].length > 0 ? step[1] : defaults;
        return [pipeline, args];
      });
    }, 100);
  }

  // Register the pipetype and add method to Query prototype
  addPipetype(newName, function () {});
  
  // Add the method to Query prototype so it can be called
  Query[newName] = function (...args) {
    return this.add(newName, args);
  };
}

///Register common aliases
function registerCommonAliases() {
  addAlias('parents', 'out', ['parent']);
  addAlias('children', 'in', ['parent']);
  addAlias('siblings', 'out', ['sibling']);
  addAlias('spouse', 'out', ['spouse']);
}

export { addAlias, registerCommonAliases };
