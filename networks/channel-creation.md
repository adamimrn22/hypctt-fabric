
# Creating a Channel

Creating a channel without system channel we focus on org1




Create the Channel Block on host

Set Path inside the cli and run configtxgen
```bash
export CHANNEL_NAME=channel1
export CHANNEL_PATH=./channel-artifacts/channel1/channel1.block

configtxgen -profile AppChannelEtcdRaft -outputBlock ./channel-artifacts/channel1/channel1.block -channelID channel1
```

Get into the docker cli 

```bash
docker exec -it cliorg1 bash
```

Set Path inside the cli
```bash
export CHANNEL_NAME=channel1
export ORDERER_ADMIN_ADDRESS=orderer1.hypctt.com:7053
export CHANNEL_PATH=./channel-artifacts/channel1/channel1.block
```

Join the orderer
```bash
osnadmin channel join --channelID $CHANNEL_NAME --config-block $CHANNEL_PATH -o $ORDERER_ADDRESS --ca-file $ORDERER_CA --client-cert $ADMIN_CERT --client-key $ADMIN_KEY
```

Join Channel
```bash
peer channel join -b $CHANNEL_PATH
```

Create new tab and change peer config for peer0 to join *Right now it is on peer1

```bash
export CORE_PEER_ADDRESS=peer0.org1.hypctt.com:7051
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_TLS_CERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/crypto/peerOrganizations/org1.hypctt.com/peers/peer0.org1.hypctt.com/tls/server.crt
export CORE_PEER_TLS_KEY_FILE=/opt/gopath/src/github.com/hyperledger/fabric/crypto/peerOrganizations/org1.hypctt.com/peers/peer0.org1.hypctt.com/tls/server.key
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/crypto/peerOrganizations/org1.hypctt.com/peers/peer0.org1.hypctt.com/tls/ca.crt
```

Join the channel as peer0
```bash
peer channel join -b $CHANNEL_PATH
```