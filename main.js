// main.js
const VectorDHTNode = require('./dhtNode');

async function main() {
    const node1 = new VectorDHTNode('node1', '127.0.0.1', 5000);
    const node2 = new VectorDHTNode('node2', '127.0.0.1', 5001);

    await node1.startServer();
    await node2.startServer();

    await node2.joinNetwork(node1);

    const vectorToInsert = [1.0, 2.0, 3.0];
    await node1.insert('example_key', vectorToInsert);

    const retrievedVector = await node1.lookup('example_key');
    console.log(`Retrieved Vector: ${retrievedVector}`);

    process.exit(0); // Terminate the process
}

main();

