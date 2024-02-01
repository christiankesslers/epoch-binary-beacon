// dhtNode.js
const murmurhash3 = require('./murmurhash3');
const kademlia = require('./kademlia');

class VectorDHTNode {
    constructor(nodeId, ip, port) {
        this.nodeId = nodeId;
        this.ip = ip;
        this.port = port;
        this.routingTable = {};
        this.vectorDb = {};
        this.dimension = 3;
    }

    async handleRequest(reader, writer) {
        const data = await reader.read(10000);
        const message = JSON.parse(data.toString());

        if (message.action === 'lookup') {
            const key = message.key;
            const vector = this.vectorDb[key] || null;
            const response = { result: vector };
            writer.write(JSON.stringify(response));
        } else if (message.action === 'insert') {
            const key = message.key;
            const vector = message.value;
            this.vectorDb[key] = vector;
            const response = { result: 'OK' };
            writer.write(JSON.stringify(response));
        }

        await writer.drain();
        writer.close();
    }

    async startServer() {
        const server = await require('net').createServer((socket) => {
            this.handleRequest(socket, socket);
        });

        server.listen(this.port, this.ip, () => {
            console.log(`Node ${this.nodeId} is listening on 
${this.ip}:${this.port}`);
        });

        // Periodically update the routing table for load balancing
        setInterval(() => {
            kademlia.updateRoutingTable(this);
        }, 5000);
    }

    async joinNetwork(existingNode) {
        const existingNodeAddress = { host: existingNode.ip, port: 
existingNode.port };
        const request = { action: 'join', nodeId: this.nodeId, ip: 
this.ip, port: this.port };

        const socket = await 
require('net').createConnection(existingNodeAddress);
        socket.write(JSON.stringify(request));
        socket.end();
    }

    murmurhash3_32(data) {
        return murmurhash3.hash(data) >>> 0; // Unsigned 32-bit integer
    }

    generateKey(data) {
        return this.murmurhash3_32(data).toString();
    }

    async lookup(key) {
        const targetKey = this.generateKey(key);
        const nodeId = this.findNode(targetKey);

        const nodeAddress = this.routingTable[nodeId];
        const request = { action: 'lookup', key };

        const socket = await require('net').createConnection(nodeAddress);
        socket.write(JSON.stringify(request));

        const response = JSON.parse(await new Promise((resolve) => {
            socket.on('data', (data) => resolve(data.toString()));
        }));

        socket.end();

        return response.result;
    }

    async insert(key, vector) {
        const targetKey = this.generateKey(key);
        const nodeId = this.findNode(targetKey);

        const nodeAddress = this.routingTable[nodeId];
        const request = { action: 'insert', key, value: vector };

        const socket = await require('net').createConnection(nodeAddress);
        socket.write(JSON.stringify(request));

        const response = JSON.parse(await new Promise((resolve) => {
            socket.on('data', (data) => resolve(data.toString()));
        }));

        socket.end();

        // Handle data persistence and replication
        await this.handleDataPersistence(key, vector, nodeId);

        return response.result;
    }

    findNode(targetKey) {
        const closestNodes = Object.keys(this.routingTable).sort((a, b) => 
{
            const xorDistA = kademlia.calculateXORDistance(targetKey, a);
            const xorDistB = kademlia.calculateXORDistance(targetKey, b);
            return xorDistA - xorDistB;
        });

        return closestNodes[0];
    }

    async handleNodeFailure(failedNode) {
        // Implement logic to handle the failure of a node
        // This could involve redistributing the data hosted by the failed 
node to other healthy nodes
    }

    async handleDataPersistence(key, vector, nodeId) {
        // Implement logic for data persistence and replication
        // This could involve replicating the data to other nodes and 
ensuring data consistency
        // Also, handle the case when a node fails after successful data 
insertion
    }
}

module.exports = VectorDHTNode;

