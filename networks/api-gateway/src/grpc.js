import grpc from '@grpc/grpc-js';
import { connect } from '@hyperledger/fabric-gateway';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

// Configuration for the existing network
const config = {
    channelName: 'orgonechannel',
    chaincodeName: 'basic',
    tlsCertPath: path.resolve(__dirname, '../../crypto-config/peerOrganizations/org1.hypctt.com/peers/peer1.org1.hypctt.com/tls/ca.crt'),
    certPath: path.resolve(__dirname, '../../crypto-config/peerOrganizations/org1.hypctt.com/users/Admin@org1.hypctt.com/msp/signcerts/Admin@org1.hypctt.com-cert.pem'),
    keyPath: path.resolve(__dirname, '../../crypto-config/peerOrganizations/org1.hypctt.com/users/Admin@org1.hypctt.com/msp/keystore/priv_sk'),
    peerEndpoint: 'localhost:8051',
    peerHostName: 'peer1.org1.hypctt.com',
};

// Load gRPC connection
async function createGrpcConnection() {
    const tlsRootCert = fs.readFileSync(config.tlsCertPath);
    const credentials = grpc.credentials.createSsl(tlsRootCert);
    return new grpc.Client(config.peerEndpoint, credentials, {
        'grpc.ssl_target_name_override': config.peerHostName,
    });
}

async function testChaincode() {
    try {
        const grpcConnection = await createGrpcConnection();

        // Connect to Fabric Gateway
        const gateway = connect({
            client: grpcConnection,
            identity: {
                mspId: 'org1MSP',
                credentials: fs.readFileSync(config.certPath),
            },
            signer: (digest) => {
                return crypto.createSign('SHA256').update(digest).sign(fs.readFileSync(config.keyPath));
            },
        });

        // Access the network and chaincode
        const network = gateway.getNetwork(config.channelName);
        const contract = network.getContract(config.chaincodeName);

        console.log(`Connected to channel: ${config.channelName}`);
        console.log(`Connected to chaincode: ${config.chaincodeName}`);

        // Example 1: Query all assets (Modify based on your chaincode methods)
        console.log('Querying all assets...');
        const queryResult = await contract.evaluateTransaction('GetAllAssets'); // Replace with your method
        console.log('Query Result:', JSON.parse(queryResult.toString()));

        // // Example 2: Create a new asset (if applicable in your chaincode)
        // console.log('Creating a new asset...');
        // const createResult = await contract.submitTransaction('CreateAsset', 'asset1', 'blue', '10', 'Tom', '300');
        // console.log('Create Asset Result:', createResult.toString());

        // // Example 3: Read a specific asset
        // console.log('Reading an asset...');
        // const assetResult = await contract.evaluateTransaction('ReadAsset', 'asset1');
        // console.log('Asset Details:', JSON.parse(assetResult.toString()));

        // // Cleanup
        // await gateway.close();
        // console.log('Test completed successfully.');
    } catch (error) {
        console.error('Error testing chaincode:', error);
    }
}

// Run the test
testChaincode();
