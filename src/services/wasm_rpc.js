// W3C WebSocket module shim
// (not needed in a browser or Bun)
// @ts-ignore
globalThis.WebSocket = require('websocket').w3cwebsocket;

const kaspa = require('../wasm/kaspa');

const {
    RpcClient,
    Resolver
} = kaspa;

const subscribeBlock = async (wss) => {
    console.log('Subscribing to new blocks...');

    const rpc = new RpcClient({
        resolver: new Resolver(),
        networkId: 'mainnet'
    });

    // const info = await rpc.getBlockDagInfo();
    // console.log("GetBlockDagInfo response:", info);    

    rpc.addEventListener('connect', async (event) => {
        console.log('Connected to Kaspa node:', event);
        await rpc.subscribeBlockAdded();
    })

    rpc.addEventListener('disconnect', async (event) => {
        console.log('Disconnected from Kaspa node:', event);
    });

    rpc.addEventListener('block-added', async (event) => {
        console.log('New block added:', event.data);

        // Broadcast the block-added event data to all WebSocket clients
        wss.clients.forEach((client) => {
            if (client.readyState === 1) { // WebSocket.OPEN
                client.send(JSON.stringify({ 
                    type: 'block-added', 
                    id: event.data.block.header.hash, 
                    txCount: event.data.block.header.bits
                }));
            }
        });
    })    

    await rpc.connect();
}

module.exports= subscribeBlock;