

import { createGraph } from '../core/graph.js';
import fs from 'fs';
import path from 'path';

const STORAGE_DIR = './dagoba-data';

function persist(graph, name = 'graph') {
  const data = graph.toString();

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('DAGOBA::' + name, data);
    return true;
  }

  try {

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

function depersist(name = 'graph') {

  if (typeof localStorage !== 'undefined') {
    const key = 'DAGOBA::' + name;
    const flatGraph = localStorage.getItem(key);

    if (!flatGraph) {
      console.error(`No graph found with name: ${name}`);
      return null;
    }

    return fromString(flatGraph);
  }

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

function fromString(str) {
  const obj = JSON.parse(str);
  return createGraph(obj.V, obj.E);
}

export { persist, depersist, fromString };
