import Dagoba from '../src/index.js';

console.log('\n\n=== Knowledge Graph Example ===\n');

const knowledge = Dagoba.graph();

// Add concepts
const concepts = [
  { _id: 'js', name: 'JavaScript', category: 'language', difficulty: 'medium' },
  { _id: 'python', name: 'Python', category: 'language', difficulty: 'easy' },
  { _id: 'node', name: 'Node.js', category: 'runtime', difficulty: 'medium' },
  { _id: 'react', name: 'React', category: 'library', difficulty: 'medium' },
  { _id: 'vue', name: 'Vue', category: 'framework', difficulty: 'easy' },
  { _id: 'express', name: 'Express', category: 'framework', difficulty: 'easy' },
  { _id: 'web-dev', name: 'Web Development', category: 'field', difficulty: 'medium' },
  { _id: 'frontend', name: 'Frontend Development', category: 'field', difficulty: 'medium' },
  { _id: 'backend', name: 'Backend Development', category: 'field', difficulty: 'medium' },
  { _id: 'fullstack', name: 'Full Stack Development', category: 'field', difficulty: 'hard' },
  { _id: 'html', name: 'HTML', category: 'language', difficulty: 'easy' },
  { _id: 'css', name: 'CSS', category: 'language', difficulty: 'easy' },
  { _id: 'sql', name: 'SQL', category: 'language', difficulty: 'medium' },
  { _id: 'mongodb', name: 'MongoDB', category: 'database', difficulty: 'easy' }
];

concepts.forEach(concept => knowledge.addVertex(concept));

// Add relationships
const relationships = [
  // Prerequisites
  { _out: 'react', _in: 'js', _label: 'requires', strength: 'strong' },
  { _out: 'vue', _in: 'js', _label: 'requires', strength: 'strong' },
  { _out: 'node', _in: 'js', _label: 'requires', strength: 'strong' },
  { _out: 'express', _in: 'node', _label: 'requires', strength: 'strong' },
  { _out: 'frontend', _in: 'html', _label: 'requires', strength: 'strong' },
  { _out: 'frontend', _in: 'css', _label: 'requires', strength: 'strong' },
  { _out: 'frontend', _in: 'js', _label: 'requires', strength: 'strong' },
  { _out: 'backend', _in: 'node', _label: 'requires', strength: 'medium' },
  { _out: 'backend', _in: 'python', _label: 'requires', strength: 'medium' },
  { _out: 'backend', _in: 'sql', _label: 'requires', strength: 'medium' },
  { _out: 'fullstack', _in: 'frontend', _label: 'requires', strength: 'strong' },
  { _out: 'fullstack', _in: 'backend', _label: 'requires', strength: 'strong' },

  // Related concepts
  { _out: 'react', _in: 'vue', _label: 'similar_to', strength: 'medium' },
  { _out: 'mongodb', _in: 'sql', _label: 'alternative_to', strength: 'medium' },

  // Part of
  { _out: 'frontend', _in: 'web-dev', _label: 'part_of', strength: 'strong' },
  { _out: 'backend', _in: 'web-dev', _label: 'part_of', strength: 'strong' }
];

relationships.forEach(rel => knowledge.addEdge(rel));

// Add aliases
Dagoba.addAlias('requires', 'out', ['requires']);
Dagoba.addAlias('requiredBy', 'in', ['requires']);
Dagoba.addAlias('similarTo', 'out', ['similar_to']);

// Query 1: What do you need to learn React?
console.log('1. Prerequisites for React:');
const reactPrereqs = knowledge.v('react').requires().property('name').run();
console.log(reactPrereqs); // ['JavaScript']

// Query 2: What can you learn after JavaScript?
console.log('\n2. What you can learn after JavaScript:');
const afterJS = knowledge.v('js').requiredBy().property('name').run();
console.log(afterJS); // ['React', 'Vue', 'Node.js', 'Frontend Development']

// Query 3: Full learning path for Full Stack Development
console.log('\n3. Learning path for Full Stack Development:');
function getLearningPath(goalId) {
  const visited = new Set();
  const path = [];

  function traverse(nodeId, depth = 0) {
    if (visited.has(nodeId)) {
      return;
    }
    visited.add(nodeId);

    const node = knowledge.findVertexById(nodeId);
    path.push({ name: node.name, depth });

    const prerequisites = knowledge.v(nodeId).requires().run();
    prerequisites.forEach(prereq => traverse(prereq._id, depth + 1));
  }

  traverse(goalId);
  return path.sort((a, b) => b.depth - a.depth);
}

const fullstackPath = getLearningPath('fullstack');
console.log(fullstackPath.map(p => '  '.repeat(p.depth) + p.name));

// Query 4: Find easy concepts to learn
console.log('\n4. Easy concepts to start with:');
const easyConcepts = knowledge.v().filter({ difficulty: 'easy' }).property('name').run();
console.log(easyConcepts); // ['Python', 'Vue', 'Express', 'HTML', 'CSS', 'MongoDB']

// Query 5: Concepts similar to React
console.log('\n5. Concepts similar to React:');
const similarToReact = knowledge.v('react').similarTo().property('name').run();
console.log(similarToReact); // ['Vue']

// Query 6: Find languages
console.log('\n6. All programming languages:');
const languages = knowledge.v().filter({ category: 'language' }).property('name').run();
console.log(languages); // ['JavaScript', 'Python', 'HTML', 'CSS', 'SQL']

// Save knowledge graph
const saved = Dagoba.persist(knowledge, 'knowledgeGraph');
if (saved) {
  console.log('\n✅ Knowledge graph saved!');
} else {
  console.log('\n❌ Failed to save graph');
}
