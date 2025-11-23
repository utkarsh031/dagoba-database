### Dagoba Interactive REPL

### Start the REPL

```bash
npm run repl
```

### Sample Queries You Can Try

```javascript
// 1. List all vertices
dagoba> g.v()

// 2. Find a specific vertex
dagoba> g.v("alice")

// 3. Get all names
dagoba> g.v().property("name")

// 4. Find developers
dagoba> g.v().filter({role: "developer"})

// 5. Who does Alice report to?
dagoba> g.v("alice").reportsTo()

// 6. Who does Bob manage?
dagoba> g.v("bob").manages()

// 7. Chain queries
dagoba> g.v("alice").reportsTo().property("name")

// 8. Add a new vertex
dagoba> g.addVertex({_id: "eve", name: "Eve", age: 26, role: "tester"})

// 9. Add an edge
dagoba> g.addEdge({_out: "eve", _in: "bob", _label: "reports_to"})

// 10. Verify the new vertex
dagoba> g.v("eve")
```

### REPL Commands

```bash
.help      # Show help
.save mydb # Save current graph
.load mydb # Load saved graph
.clear     # Clear the graph
.exit      # Quit (or Ctrl+C, Ctrl+D)
```

### Example Session

```
dagoba> g.v().property("name")
[ 'Dave', 'Carol', 'Bob', 'Alice' ]

dagoba> g.v().filter({role: "developer"})
[
  {
    _id: 'alice',
    name: 'Alice',
    age: 28,
    role: 'developer',
    _out: [ [Object], [Object] ],
    _in: []
  },
  {
    _id: 'dave',
    name: 'Dave',
    age: 30,
    role: 'developer',
    _out: [ [Object] ],
    _in: []
  }
]

dagoba> g.v("bob").manages().property("name")
[ 'Carol', 'Alice' ]

dagoba> .save company
Graph saved as "company"!

dagoba> .exit
👋 Goodbye!
```
