# Dagoba Graph Database

A lightweight, in-memory graph database built in JavaScript with lazy query evaluation and a chainable query API.

## Features

- **Graph Data Model**: Store vertices (nodes) and edges (relationships) with custom properties
- **Lazy Evaluation**: Queries are evaluated on-demand for efficiency
- **Chainable API**: Build complex graph traversals with readable method chains
- **Pipetype System**: Extensible query operations (vertex, out, in, filter, take, shortestPathgit  etc.)
- **Query Transformers**: Automatic query optimization through transformation rules
- **Alias Support**: Create custom shorthand methods for common query patterns
- **Persistent Storage**: Save/load graphs to JSON files
- **Interactive REPL**: Terminal interface for live database interaction

## Quick Start

```bash
# Install dependencies
npm install

# Run tests
npm test

# Start interactive REPL
npm run repl

# Run examples
npm run examples
```

## Usage

### Basic Graph Operations

```javascript
import Dagoba from './src/index.js';

// Create a graph
const g = Dagoba.graph();

// Add vertices
g.addVertex({ _id: 'alice', name: 'Alice', age: 28 });
g.addVertex({ _id: 'bob', name: 'Bob', age: 32 });

// Add edges
g.addEdge({ _out: 'alice', _in: 'bob', _label: 'follows' });

// Query the graph
g.v('alice').out('follows').run();  // Returns Bob
```

### Query Examples

```javascript
// Find all vertices
g.v().run()

// Find specific vertex
g.v('alice').run()

// Traverse outgoing edges
g.v('alice').out('follows').run()

// Filter by properties
g.v().filter({ age: 28 }).run()

// Chain operations
g.v('alice').out('follows').property('name').run()

// Limit results
g.v().take(5).run()
```

### Custom Aliases

```javascript
// Create shortcuts for common patterns
Dagoba.addAlias('friends', 'out', ['follows']);

// Use the alias
g.v('alice').friends().run()
```

### Persistence
// In browser, saves graph to localStorage.

// In a NodeJS environment:
```javascript
// Save graph to file
Dagoba.persist(g, 'my-graph');

// Load graph from file
const loaded = Dagoba.depersist('my-graph');
```

## Interactive REPL

Start the REPL for interactive queries:

```bash
npm run repl
```

Commands:
- `.help` - Show help
- `.save NAME` - Save graph
- `.load NAME` - Load graph
- `.clear` - Clear graph
- `.exit` - Exit REPL

## Project Structure

```
dagoba/
├── src/
│   ├── core/
│   │   ├── graph.js         # Graph data structure
│   │   ├── query.js         # Query execution engine
│   │   ├── pipetypes.js     # Query operations
│   │   ├── transformers.js  # Query optimization
│   │   └── helpers.js       # Utility functions
│   ├── extensions/
│   │   └── aliases.js       # Alias system
│   └── utils/
│       └── persistence.js   # Save/load functionality
├── examples/               # Example applications
├── tests/                 # Test suite
└── repl.js               # Interactive REPL
```

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suite
npm run test:unit
npm run test:integration
```

## Examples

```bash
# Social network
npm run example:social

# Organization chart
npm run example:org

# Dependency graph
npm run example:deps

# Knowledge graph
npm run example:knowledge

# All examples
npm run examples
```

## API Documentation

Generate API docs:

```bash
npm run docs
```

Docs will be in `./docs/generated/`

## Use Cases

- Social networks (friends, followers, connections)
- Organization charts (reporting structures, teams)
- Dependency graphs (package managers, build systems)
- Knowledge graphs (concepts, relationships, facts)
- Any connected data that fits a graph model

## License

MIT

## Author

Vyas Giri



Inspired by [Dann Toliver](https://aosabook.org/en/500L/dagoba-an-in-memory-graph-database.html#fnref6) 🫡
