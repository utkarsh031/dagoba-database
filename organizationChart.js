import Dagoba from '../src/index.js';

console.log('\n\n=== Organization Chart Example ===\n');

const org = Dagoba.graph();

// Add employees
const employees = [
  { _id: 'ceo', name: 'Sarah Chen', title: 'CEO', department: 'Executive' },
  { _id: 'cto', name: 'Michael Brown', title: 'CTO', department: 'Technology' },
  { _id: 'cfo', name: 'Jennifer White', title: 'CFO', department: 'Finance' },
  { _id: 'vp-eng', name: 'David Lee', title: 'VP Engineering', department: 'Technology' },
  { _id: 'vp-product', name: 'Emily Davis', title: 'VP Product', department: 'Technology' },
  { _id: 'eng-lead-1', name: 'Tom Wilson', title: 'Engineering Lead', department: 'Technology' },
  { _id: 'eng-lead-2', name: 'Lisa Garcia', title: 'Engineering Lead', department: 'Technology' },
  { _id: 'dev-1', name: 'John Smith', title: 'Senior Developer', department: 'Technology' },
  { _id: 'dev-2', name: 'Anna Martinez', title: 'Developer', department: 'Technology' },
  { _id: 'dev-3', name: 'Chris Johnson', title: 'Developer', department: 'Technology' },
  { _id: 'accountant', name: 'Mark Taylor', title: 'Accountant', department: 'Finance' }
];

employees.forEach(emp => org.addVertex(emp));

// Add reporting relationships
const reports = [
  { _out: 'cto', _in: 'ceo', _label: 'reports_to' },
  { _out: 'cfo', _in: 'ceo', _label: 'reports_to' },
  { _out: 'vp-eng', _in: 'cto', _label: 'reports_to' },
  { _out: 'vp-product', _in: 'cto', _label: 'reports_to' },
  { _out: 'eng-lead-1', _in: 'vp-eng', _label: 'reports_to' },
  { _out: 'eng-lead-2', _in: 'vp-eng', _label: 'reports_to' },
  { _out: 'dev-1', _in: 'eng-lead-1', _label: 'reports_to' },
  { _out: 'dev-2', _in: 'eng-lead-1', _label: 'reports_to' },
  { _out: 'dev-3', _in: 'eng-lead-2', _label: 'reports_to' },
  { _out: 'accountant', _in: 'cfo', _label: 'reports_to' }
];

reports.forEach(report => org.addEdge(report));

// Add convenient aliases
Dagoba.addAlias('reportsTo', 'out', ['reports_to']);
Dagoba.addAlias('manages', 'in', ['reports_to']);

// Query 1: Who reports to the CTO?
console.log('1. Direct reports to CTO:');
const ctoReports = org.v('cto').manages().property('name').run();
console.log(ctoReports); // ['David Lee', 'Emily Davis']

// Query 2: All people in the CTO's org (including indirect reports)
console.log("\n2. All people in CTO's organization:");
const ctoOrg = org
  .v('cto')
  .manages()
  .as('direct')
  .manages()
  .as('indirect')
  .manages()
  .as('more')
  .merge('direct', 'indirect', 'more')
  .unique()
  .property('name')
  .run();
console.log(ctoOrg);

// Query 3: John Smith's management chain
console.log("\n3. John Smith's management chain:");
const chain = [];
let current = org.findVertexById('dev-1');
while (current) {
  chain.push(current.name);
  const managers = org.v(current._id).reportsTo().run();
  current = managers.length > 0 ? managers[0] : null;
}
console.log(chain); // ['John Smith', 'Tom Wilson', 'David Lee', 'Michael Brown', 'Sarah Chen']

// Query 4: All employees in Technology department
console.log('\n4. All Technology department employees:');
const techEmployees = org.v().filter({ department: 'Technology' }).property('name').run();
console.log(techEmployees);

// Query 5: Count of direct reports per manager
console.log('\n5. Manager report counts:');
const managers = org
  .v()
  .filter(v => v.title.includes('VP') || v.title.includes('Lead') || v.title === 'CTO')
  .run();
managers.forEach(manager => {
  const reportCount = org.v(manager._id).manages().run().length;
  console.log(`${manager.name}: ${reportCount} direct reports`);
});

// Save the org chart
const saved = Dagoba.persist(org, 'orgChart');
if (saved) {
  console.log('\n✅ Organization chart saved!');
} else {
  console.log('\n❌ Failed to save graph');
}
