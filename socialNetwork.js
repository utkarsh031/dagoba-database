import Dagoba from '../src/index.js';

console.log('\n=== Social Network Example ===\n');

// Create social network graph
const social = Dagoba.graph();

// Add users
const users = [
  { _id: 'alice', name: 'Alice', age: 28, interests: ['coding', 'hiking'] },
  { _id: 'bob', name: 'Bob', age: 32, interests: ['gaming', 'cooking'] },
  { _id: 'carol', name: 'Carol', age: 25, interests: ['hiking', 'photography'] },
  { _id: 'dave', name: 'Dave', age: 30, interests: ['coding', 'gaming'] },
  { _id: 'eve', name: 'Eve', age: 27, interests: ['photography', 'travel'] },
  { _id: 'frank', name: 'Frank', age: 35, interests: ['cooking', 'travel'] }
];

users.forEach(user => social.addVertex(user));

// Add friendships
const friendships = [
  { _out: 'alice', _in: 'bob', _label: 'friend', since: '2020' },
  { _out: 'alice', _in: 'carol', _label: 'friend', since: '2019' },
  { _out: 'bob', _in: 'dave', _label: 'friend', since: '2021' },
  { _out: 'bob', _in: 'frank', _label: 'friend', since: '2020' },
  { _out: 'carol', _in: 'eve', _label: 'friend', since: '2022' },
  { _out: 'dave', _in: 'frank', _label: 'friend', since: '2019' },
  { _out: 'eve', _in: 'frank', _label: 'friend', since: '2021' }
];

friendships.forEach(friendship => social.addEdge(friendship));

// Add friend alias
Dagoba.addAlias('friends', 'out', ['friend']);

// Query 1: Alice's friends
console.log("1. Alice's friends:");
const aliceFriends = social.v('alice').friends().property('name').run();
console.log(aliceFriends); // ['Bob', 'Carol']

// Query 2: Friends of friends (2nd degree connections)
console.log("\n2. Alice's friends of friends:");
const friendsOfFriends = social.v('alice').friends().friends().unique().property('name').run();
console.log(friendsOfFriends); // ['Dave', 'Frank', 'Eve']

// Query 3: Friend recommendations (friends of friends who aren't already friends)
console.log('\n3. Friend recommendations for Alice:');
const recommendations = social
  .v('alice')
  .as('me')
  .friends()
  .as('myFriend')
  .friends()
  .except('myFriend')
  .except('me')
  .unique()
  .property('name')
  .run();
console.log(recommendations); // ['Dave', 'Frank', 'Eve']

// Query 4: Users interested in hiking
console.log('\n4. Users interested in hiking:');
const hikingFans = social
  .v()
  .filter(user => user.interests.includes('hiking'))
  .property('name')
  .run();
console.log(hikingFans); // ['Alice', 'Carol']

// Query 5: Mutual friends between Alice and Dave
console.log('\n5. Mutual friends between Alice and Dave:');
const aliceFriendIds = social
  .v('alice')
  .friends()
  .run()
  .map(v => v._id);
const daveFriendIds = social
  .v('dave')
  .friends()
  .run()
  .map(v => v._id);
const mutualFriends = aliceFriendIds.filter(id => daveFriendIds.includes(id));
const mutualNames = mutualFriends.map(id => social.findVertexById(id).name);
console.log(mutualNames); // ['Bob', 'Frank']

// Query 6: Find users over 30
console.log('\n6. Users over 30:');
const over30 = social
  .v()
  .filter({ age: user => user > 30 })
  .property('name')
  .run();
console.log(over30); // ['Bob', 'Frank']

// Query 7: Shortest path between Alice and Frank
console.log('\n7. Shortest path from Alice to Frank:');
const path = social.findShortestPath('alice', 'frank');
const pathNames = path ? path.map(v => v.name) : null;
console.log(pathNames); // ['Alice', 'Bob', 'Frank']

// Save the graph
const saved = Dagoba.persist(social, 'socialNetwork');
if (saved) {
  console.log('\n✅ Social network saved!');
} else {
  console.log('\n❌ Failed to save graph');
}
