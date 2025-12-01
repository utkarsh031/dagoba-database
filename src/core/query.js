///Query - Query execution system

const Query = {
  ///Add a step to the query program
  add(pipetype, args) {
    const step = [pipetype, args];
    this.program.push(step);
    return this;
  },

  ///Another way to start a vertex query (alternative to graph.v())
  v() {
    return this.add('vertex', Array.prototype.slice.call(arguments));
  },

  ///Execute the query
  run() {
    ///Apply transformers to optimize the query
    this.program = transform(this.program);

    const max = this.program.length - 1;
    let maybeGremlin = false;
    const results = [];
    let done = -1;
    let pc = max;

    while (done < max) {
      ///Apply transformers
      const step = this.program[pc];
      const state = (this.state[pc] = this.state[pc] || {});
      const pipetype = getPipetype(step[0]);

      maybeGremlin = pipetype(this.graph, step[1], maybeGremlin, state);

      if (maybeGremlin === 'pull') {
        maybeGremlin = false;
        if (pc - 1 > done) {
          pc--;
          continue;
        } else {
          done = pc;
        }
      }

      if (maybeGremlin === 'done') {
        maybeGremlin = false;
        done = pc;
      }

      pc++;

      if (pc > max) {
        if (maybeGremlin) {
          results.push(maybeGremlin);
        }
        maybeGremlin = false;
        pc--;
      }
    }

    return results.map(gremlin => {
      return gremlin.result != null ? gremlin.result : gremlin.vertex;
    });
  }
};

///Factory function to create queries
function createQuery(graph) {
  const query = Object.create(Query);

  query.graph = graph;
  query.state = [];
  query.program = [];
  query.gremlins = [];

  return query;
}

///Dependencies
let getPipetype, transform;

function setQueryDependencies(deps) {
  getPipetype = deps.getPipetype;
  transform = deps.transform;
}

export { createQuery, Query, setQueryDependencies };
