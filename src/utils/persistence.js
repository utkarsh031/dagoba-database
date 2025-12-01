///Persistence - Save and load graphs

import { createGraph } from '../core/graph.js';
import fs from 'fs';
import path from 'path';

// Storage directory for Node.js environments
const STORAGE_DIR = './dagoba-data';

///Save graph to localStorage (browser) or file system (Node.js)
function persist(graph, name = 'graph') {
  const data = graph.toString();
  
  // Browser environment - use localStorage
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('DAGOBA::' + name, data);
    return true;
  }
  
  // Node.js environment - use file system
  try {
    // Create storage directory if it doesn't exist
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
    
    const filePath = path.join(STORAGE_DIR, `${name}.json`);
    fs.writeFileSync(filePath, data, 'utf8');
    return true;
  } catch (err) {
    console.error('Failed to persist graph:', err.message);
    return false;
  }
}

///Load graph from localStorage (browser) or file system (Node.js)
function depersist(name = 'graph') { 
  // Browser environment - use localStorage
  if (typeof localStorage !== 'undefined') {
    const key = 'DAGOBA::' + name;
    const flatGraph = localStorage.getItem(key);

    if (!flatGraph) {
      console.error(`No graph found with name: ${name}`);
      return null;
    }

    return fromString(flatGraph);
  }
  
  // Node.js environment - use file system
  try {
    const filePath = path.join(STORAGE_DIR, `${name}.json`);
    
    if (!fs.existsSync(filePath)) {
      console.error(`No graph found with name: ${name}`);
      return null;
    }
    
    const flatGraph = fs.readFileSync(filePath, 'utf8');
    return fromString(flatGraph);
  } catch (err) {
    console.error('Failed to load graph:', err.message);
    return null;
  }
}

///Create graph from JSON string

function fromString(str) {
  const obj = JSON.parse(str);
  return createGraph(obj.V, obj.E);
}

export { persist, depersist, fromString };
