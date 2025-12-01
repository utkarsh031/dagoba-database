#!/usr/bin/env node

import Dagoba from './src/index.js';
import readline from 'readline';
import { inspect } from 'util';

const g = Dagoba.graph();

const sampleVertices = [
  { _id: 'alice', name: 'Alice', age: 28, role: 'developer' },
  { _id: 'bob', name: 'Bob', age: 32, role: 'manager' },
  { _id: 'carol', name: 'Carol', age: 25, role: 'designer' },
  { _id: 'dave', name: 'Dave', age: 30, role: 'developer' }
];

const sampleEdges = [
  { _out: 'alice', _in: 'bob', _label: 'reports_to' },
  { _out: 'carol', _in: 'bob', _label: 'reports_to' },
  { _out: 'dave', _in: 'alice', _label: 'works_with' },
  { _out: 'alice', _in: 'carol', _label: 'works_with' }
];

sampleVertices.forEach(v => g.addVertex(v));
sampleEdges.forEach(e => g.addEdge(e));

Dagoba.addAlias('reportsTo', 'out', ['reports_to']);
Dagoba.addAlias('manages', 'in', ['reports_to']);
Dagoba.addAlias('worksWith', 'out', ['works_with']);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'dagoba> '
});

console.log('║          Dagoba Graph Database REPL            ║');
console.log('╚════════════════════════════════════════════════╝\n');
console.log('Sample graph loaded with 4 vertices and 4 edges.');
console.log('\n Try these commands:');
console.log('  g.v()                           - List all vertices');
console.log('  g.v("alice")                    - Find Alice');
console.log('  g.v("alice").reportsTo()        - Who Alice reports to');
console.log('  g.v("bob").manages()            - Who Bob manages');
console.log('  g.v().filter({role:"developer"}) - Find developers');
console.log('  g.v().property("name")          - Get all names');
console.log('\n Other commands:');
console.log('  .help      - Show this help');
console.log('  .save NAME - Save graph to file');
console.log('  .load NAME - Load graph from file');
console.log('  .clear     - Clear current graph');
console.log('  .exit      - Exit REPL\n');

function formatOutput(result) {
  if (Array.isArray(result)) {
    if (result.length === 0) return '[]';

    if (typeof result[0] !== 'object') {
      return JSON.stringify(result, null, 2);
    }

    return inspect(result, {
      depth: 3,
      colors: true,
      compact: false
    });
  }

  return inspect(result, {
    depth: 3,
    colors: true
  });
}

const commands = {
  '.help': () => {
    console.log('\n Dagoba REPL Commands:\n');
    console.log('Query Examples:');
    console.log('  g.v()                          - All vertices');
    console.log('  g.v("id")                      - Vertex by ID');
    console.log('  g.v("id").out("label")         - Traverse outgoing edges');
    console.log('  g.v("id").in("label")          - Traverse incoming edges');
    console.log('  g.v().filter({key: value})     - Filter by property');
    console.log('  g.v().property("name")         - Extract property');
    console.log('  g.v().unique()                 - Remove duplicates');
    console.log('  g.v().take(n)                  - Limit results\n');

    console.log('Graph Manipulation:');
    console.log('  g.addVertex({_id: "x", ...})   - Add vertex');
    console.log('  g.addEdge({_out: "a", _in: "b", _label: "l"}) - Add edge\n');

    console.log('REPL Commands:');
    console.log('  .save NAME - Save current graph');
    console.log('  .load NAME - Load saved graph');
    console.log('  .clear     - Reset graph');
    console.log('  .exit      - Quit\n');
  },

  '.save': (name) => {
    if (!name) {
      console.log('Usage: .save <name>');
      return;
    }
    const saved = Dagoba.persist(g, name);
    if (saved) {
      console.log(`Graph saved as "${name}"`);
    } else {
      console.log('Failed to save graph');
    }
  },

  '.load': (name) => {
    if (!name) {
      console.log('Usage: .load <name>');
      return;
    }
    const loaded = Dagoba.depersist(name);
    if (loaded) {

      g.vertices = loaded.vertices;
      g.edges = loaded.edges;
      g.vertexIndex = loaded.vertexIndex;
      g.inEdgeIndex = loaded.inEdgeIndex;
      g.outEdgeIndex = loaded.outEdgeIndex;
      console.log(`Graph "${name}" loaded`);
    } else {
      console.log(`Failed to load graph "${name}"`);
    }
  },

  '.clear': () => {
    g.vertices = [];
    g.edges = [];
    g.vertexIndex = {};
    g.inEdgeIndex = {};
    g.outEdgeIndex = {};
    g.autoId = 1;
    console.log('Graph cleared');
  },

  '.exit': () => {
    console.log('\n Goodbye!\n');
    process.exit(0);
  }
};

rl.on('line', (line) => {
  const input = line.trim();

  if (!input) {
    rl.prompt();
    return;
  }

  if (input.startsWith('.')) {
    const [cmd, ...args] = input.split(' ');
    const handler = commands[cmd];

    if (handler) {
      handler(args.join(' '));
    } else {
      console.log(`Unknown command: ${cmd}`);
      console.log('Type .help for available commands');
    }
    rl.prompt();
    return;
  }

  try {

    const result = eval(input);

    if (result && typeof result.run === 'function') {
      const output = result.run();
      console.log(formatOutput(output));
    } else {

      console.log(formatOutput(result));
    }
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }

  rl.prompt();
});

rl.on('close', () => {
  console.log('\n Goodbye!\n');
  process.exit(0);
});

rl.prompt();
