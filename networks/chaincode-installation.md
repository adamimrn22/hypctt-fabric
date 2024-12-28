
# Chaincode Installation

Installing chaincode on peer

- Make sure both tab are open 

```bash
docker exec -it cliorg1 bash
```


Go to the installed chaincode path
```bash
cd ../../chaincode
```

Installed the chaincode
```bash
peer lifecycle chaincode install basic.tar.gz
```

Check the installed chaincode ID
```bash
peer lifecycle chaincode queryinstalled
export PACKAGE_ID=<packageid>
```

Export Path
```bash
export CHANNEL_NAME=channel1
export CHAINCODE_NAME=basic
export VERSION=1.0
export SEQUENCE=1 
export ORDERER_ADDRESS=orderer1.hypctt.com:7050

```
Approve Organization
```bash
peer lifecycle chaincode approveformyorg --channelID $CHANNEL_NAME --name $CHAINCODE_NAME --version $VERSION --package-id $PACKAGE_ID --sequence $SEQUENCE --tls --cafile $ORDERER_CA
```

Chaincode Commit

```bash
peer lifecycle chaincode commit --channelID $CHANNEL_NAME --name $CHAINCODE_NAME --version $VERSION --sequence $SEQUENCE -o $ORDERER_ADDRESS --tls --cafile $ORDERER_CA --peerAddresses $CORE_PEER_ADDRESS --tlsRootCertFiles $CORE_PEER_TLS_ROOTCERT_FILE  
```

On other tab for peer0

- make sure all config are exported 

Go to the installed chaincode path
```bash
cd ../../chaincode
```

Installed the chaincode **make sure install for both peer first before commit**
```bash
peer lifecycle chaincode install basic.tar.gz
```

Invoke the Chaincode
```bash
peer chaincode invoke -o $ORDERER_ADDRESS --tls --cafile $ORDERER_CA -C $CHANNEL_NAME -n $CHAINCODE_NAME -c '{"Args":["InitLedger"]}'
```

Invoke the Chaincode *On the peer1 tab to see both data are synchronize
```bash
peer chaincode query -C $CHANNEL_NAME -n $CHAINCODE_NAME -c '{"Args":["GetAllAssets"]}'
```

