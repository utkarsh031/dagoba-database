import Dagoba from '../src/index.js';

console.log('\n\n=== Dependency Graph Example ===\n');

const deps = Dagoba.graph();

// Add packages
const packages = [
  { _id: 'react', name: 'React', version: '18.2.0', type: 'library' },
  { _id: 'react-dom', name: 'React DOM', version: '18.2.0', type: 'library' },
  { _id: 'webpack', name: 'Webpack', version: '5.88.0', type: 'bundler' },
  { _id: 'babel', name: 'Babel', version: '7.22.0', type: 'compiler' },
  { _id: 'babel-loader', name: 'Babel Loader', version: '9.1.0', type: 'plugin' },
  { _id: 'lodash', name: 'Lodash', version: '4.17.21', type: 'utility' },
  { _id: 'axios', name: 'Axios', version: '1.4.0', type: 'http' },
  { _id: 'eslint', name: 'ESLint', version: '8.45.0', type: 'linter' },
  { _id: 'jest', name: 'Jest', version: '29.6.0', type: 'testing' },
  { _id: 'prettier', name: 'Prettier', version: '3.0.0', type: 'formatter' }
];

packages.forEach(pkg => deps.addVertex(pkg));

// Add dependencies
const dependencies = [
  { _out: 'react-dom', _in: 'react', _label: 'depends', type: 'peer' },
  { _out: 'webpack', _in: 'babel-loader', _label: 'depends', type: 'dev' },
  { _out: 'babel-loader', _in: 'babel', _label: 'depends', type: 'peer' },
  { _out: 'react', _in: 'babel', _label: 'depends', type: 'dev' },
  { _out: 'webpack', _in: 'babel', _label: 'depends', type: 'dev' },
  { _out: 'axios', _in: 'lodash', _label: 'depends', type: 'prod' },
  { _out: 'jest', _in: 'babel', _label: 'depends', type: 'dev' },
  { _out: 'react', _in: 'lodash', _label: 'depends', type: 'prod' }
];

dependencies.forEach(dep => deps.addEdge(dep));

// Add alias
Dagoba.addAlias('dependsOn', 'out', ['depends']);
Dagoba.addAlias('usedBy', 'in', ['depends']);

// Query 1: React's direct dependencies
console.log("1. React's direct dependencies:");
const reactDeps = deps.v('react').dependsOn().property('name').run();
console.log(reactDeps); // ['Babel', 'Lodash']

// Query 2: What depends on Babel?
console.log('\n2. Packages that depend on Babel:');
const babelUsers = deps.v('babel').usedBy().property('name').run();
console.log(babelUsers); // ['Babel Loader', 'React', 'Webpack', 'Jest']

// Query 3: All transitive dependencies of React
console.log('\n3. All transitive dependencies of React:');
function findAllDependencies(packageId) {
  const visited = new Set();
  const queue = [packageId];
  const result = [];

  while (queue.length > 0) {
    const current = queue.shift();
    if (visited.has(current)) {
      continue;
    }
    visited.add(current);

    const directDeps = deps.v(current).dependsOn().run();
    directDeps.forEach(dep => {
      if (!visited.has(dep._id)) {
        result.push(dep.name);
        queue.push(dep._id);
      }
    });
  }

  return result;
}

const allReactDeps = findAllDependencies('react');
console.log(allReactDeps); // ['Babel', 'Lodash']

// Query 4: Find packages with no dependencies (leaf nodes)
console.log('\n4. Packages with no dependencies:');
const leafPackages = deps
  .v()
  .filter(pkg => deps.v(pkg._id).dependsOn().run().length === 0)
  .property('name')
  .run();
console.log(leafPackages); // ['Lodash', 'Prettier', 'ESLint']

// Query 5: Most depended-upon packages
console.log('\n5. Most popular packages (most dependents):');
const packagePopularity = packages
  .map(pkg => ({
    name: pkg.name,
    dependents: deps.v(pkg._id).usedBy().run().length
  }))
  .sort((a, b) => b.dependents - a.dependents);
console.log(packagePopularity.slice(0, 3));

// Save dependencies
const saved = Dagoba.persist(deps, 'dependencies');
if (saved) {
  console.log('\n✅ Dependency graph saved!');
} else {
  console.log('\n❌ Failed to save graph');
}
