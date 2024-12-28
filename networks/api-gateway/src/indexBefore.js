// I WANT TO SEE WHAT I DID WRONG 

import express from 'express';
import bodyParser from 'body-parser';
import * as grpc from '@grpc/grpc-js';
import { connect, hash, signers } from '@hyperledger/fabric-gateway';
import * as crypto from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Helper function to load connection details (paths to certs and keys)
async function loadClientConnectionDetails() {
    const __dirname = path.dirname(new URL(import.meta.url).pathname);
    const certPath = path.resolve(__dirname, '../../crypto-config/peerOrganizations/org1.hypctt.com/users/User1@org1.hypctt.com/msp');

    return {
        tlsCertPath: path.resolve(__dirname, '../../crypto-config/peerOrganizations/org1.hypctt.com/peers/peer0.org1.hypctt.com/tls/ca.crt'),
        certPath: path.join(certPath, 'signcerts/User1@org1.hypctt.com-cert.pem'),
        keyPath: path.join(certPath, 'keystore/priv_sk'),
        peerEndpoint: 'localhost:7051', // Adjust to your peer endpoint
        mspId: 'org1MSP', // Adjust as per your MSP
        channelName: 'channel1', // Adjust as per your channel name
        chaincodeName: 'basic' // Adjust to your chaincode name
    };
}

// Helper function to create gRPC client
async function createGrpcClient(tlsCertPath) {
    const tlsRootCert = await fs.readFile(tlsCertPath);
    const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
    return new grpc.Client('localhost:7051', tlsCredentials, {
        'grpc.ssl_target_name_override': 'peer0.org1.hypctt.com',
        'grpc.keepalive_time_ms': 60000,
    });
}

// Function to create Fabric Gateway connection
async function createFabricGateway(connectionDetails) {
    const credentials = await fs.readFile(connectionDetails.certPath);
    const privateKeyPem = await fs.readFile(connectionDetails.keyPath);
    const privateKey = crypto.createPrivateKey(privateKeyPem);
    const signer = signers.newPrivateKeySigner(privateKey);

    const grpcClient = await createGrpcClient(connectionDetails.tlsCertPath);

    return connect({
        identity: { mspId: connectionDetails.mspId, credentials },
        signer,
        hash: hash.sha256,
        client: grpcClient
    });
}

// Middleware to establish the Fabric Gateway connection and attach to request
async function fabricGatewayMiddleware(req, res, next) {
    try {
        const connectionDetails = await loadClientConnectionDetails();
        const gateway = await createFabricGateway(connectionDetails);

        // Get network and contract for the specific chaincode
        const network = gateway.getNetwork(connectionDetails.channelName);
        const contract = network.getContract(connectionDetails.chaincodeName);

        // Attach the gateway and contract to the request object for use in route handlers
        req.gateway = gateway;
        req.contract = contract;

        next();
    } catch (error) {
        console.error('Fabric Gateway Connection Error:', error);
        res.status(500).json({ error: error.message });
    }
}

// Sample endpoint to verify the setup (Simple Hello World)
app.get('/', fabricGatewayMiddleware, async (req, res) => {
    res.json({
        success: true,
        message: 'Hello, Fabric API is working!'
    });
});

// Endpoint to initialize the ledger (calls InitLedger function of chaincode)
app.post('/init-ledger', fabricGatewayMiddleware, async (req, res) => {
    try {
        const result = await req.contract.submitTransaction('InitLedger');
        await req.gateway.close();
        res.json({
            success: true,
            message: 'Ledger initialized successfully'
        });
    } catch (error) {
        console.error('Init Ledger Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Endpoint to create a new asset
app.post('/assets', fabricGatewayMiddleware, async (req, res) => {
    try {
        const { id, color, size, owner, appraisedValue } = req.body;
        const result = await req.contract.submitTransaction(
            'CreateAsset',
            id,
            color,
            size.toString(),
            owner,
            appraisedValue.toString()
        );
        await req.gateway.close();
        res.json({
            success: true,
            message: `Asset ${id} created successfully`
        });
    } catch (error) {
        console.error('Create Asset Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Endpoint to read an asset
app.get('/assets/:id', fabricGatewayMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await req.contract.evaluateTransaction('ReadAsset', id);
        await req.gateway.close();
        res.json({
            success: true,
            asset: JSON.parse(result.toString())
        });
    } catch (error) {
        console.error('Read Asset Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Endpoint to update an asset
app.put('/assets/:id', fabricGatewayMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { color, size, owner, appraisedValue } = req.body;
        const result = await req.contract.submitTransaction(
            'UpdateAsset',
            id,
            color,
            size.toString(),
            owner,
            appraisedValue.toString()
        );
        await req.gateway.close();
        res.json({
            success: true,
            message: `Asset ${id} updated successfully`
        });
    } catch (error) {
        console.error('Update Asset Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Endpoint to delete an asset
app.delete('/assets/:id', fabricGatewayMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        await req.contract.submitTransaction('DeleteAsset', id);
        await req.gateway.close();
        res.json({
            success: true,
            message: `Asset ${id} deleted successfully`
        });
    } catch (error) {
        console.error('Delete Asset Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Endpoint to transfer an asset
app.post('/assets/:id/transfer', fabricGatewayMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { newOwner } = req.body;
        const result = await req.contract.submitTransaction('TransferAsset', id, newOwner);
        await req.gateway.close();
        res.json({
            success: true,
            oldOwner: result.toString()
        });
    } catch (error) {
        console.error('Transfer Asset Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Endpoint to get all assets
app.get('/assets', fabricGatewayMiddleware, async (req, res) => {
    try {
        const result = await req.contract.evaluateTransaction('GetAllAssets');
        await req.gateway.close();
        res.json({
            success: true,
            assets: JSON.parse(result.toString())
        });
    } catch (error) {
        console.error('Get All Assets Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Fabric Gateway API running on port ${PORT}`);
});
