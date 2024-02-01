// kademlia.js
const murmurhash3 = require('./murmurhash3');

const kBucketSize = 8;  // Number of nodes per bucket

function calculateXORDistance(nodeId1, nodeId2) {
    const intNodeId1 = parseInt(nodeId1, 16);
    const intNodeId2 = parseInt(nodeId2, 16);
    return intNodeId1 ^ intNodeId2;
}

function updateRoutingTable(node) {
    const allNodes = Object.keys(node.routingTable);
    const currentNodeId = node.nodeId;

    // Sort nodes based on XOR distance from the current node
    const sortedNodes = allNodes.sort((a, b) => {
        const xor

