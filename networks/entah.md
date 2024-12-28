
nak run  docker-compose -f compose-files/orderers/orderer1-raft.yaml -f compose-files/peers/peersorg1.yaml -f compose-files/peers/peersorg2.yaml up -d
nak down docker-compose -f compose-files/orderers/orderer1-raft.yaml -f compose-files/peers/peersorg1.yaml -f compose-files/peers/peersorg2.yaml --volumes --remove-orphans

<!-- # Set the environment for the peer connection

for org1
export CORE_PEER_ADDRESS=peer0.org1.hypctt.com:7051
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_TLS_CERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/crypto/peerOrganizations/org1.hypctt.com/peers/peer0.org1.hypctt.com/tls/server.crt
export CORE_PEER_TLS_KEY_FILE=/opt/gopath/src/github.com/hyperledger/fabric/crypto/peerOrganizations/org1.hypctt.com/peers/peer0.org1.hypctt.com/tls/server.key
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/crypto/peerOrganizations/org1.hypctt.com/peers/peer0.org1.hypctt.com/tls/ca.crt

for org2
export CORE_PEER_ADDRESS=peer0.org2.hypctt.com:7061
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_TLS_CERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/crypto/peerOrganizations/org2.hypctt.com/peers/peer0.org2.hypctt.com/tls/server.crt
export CORE_PEER_TLS_KEY_FILE=/opt/gopath/src/github.com/hyperledger/fabric/crypto/peerOrganizations/org2.hypctt.com/peers/peer0.org2.hypctt.com/tls/server.key
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/crypto/peerOrganizations/org2.hypctt.com/peers/peer0.org2.hypctt.com/tls/ca.crt
 -->

docker exec -it cliorg1 bash
docker exec -it cliorg2 bash


orderer join channel
osnadmin channel join --channelID channel1 --config-block ./channel-artifacts/channel1/channel1.block -o orderer1.hypctt.com:7053 --ca-file $ORDERER_CA --client-cert $ADMIN_CERT --client-key $ADMIN_KEY

check orderer channel list
osnadmin channel list -o orderer1.hypctt.com:7053 --ca-file $ORDERER_CA --client-cert $ADMIN_CERT --client-key $ADMIN_KEY 

# Join the peer to the channel
peer channel join -b ./channel-artifacts/channel1/channel1.block
 

# update anchor peer
 peer channel fetch config channel-artifacts/config_block.pb -o orderer1.hypctt.com:7050 --ordererTLSHostnameOverride orderer1.hypctt.com -c channel1 --tls --cafile "$ORDERER_CA"

cd channel-artifacts/channel1


 

 peer channel update -f channel-artifacts/channel1/config_update_in_envelope.pb -c channel1 -o orderer1.hypctt.com:7050  --ordererTLSHostnameOverride orderer1.hypctt.com --tls --cafile "ORDERER_CA"



 peer channel fetch config ./channel-artifacts/channel1/config_block.pb -c $CHANNEL_NAME -o orderer1.hypctt.com:7050 --ordererTLSHostnameOverride orderer1.hypctt.com --tls --cafile "$ORDERER_CA"

 configtxlator proto_decode --input config_block.pb --type common.Block --output config_block.json
peer channel update -f channel-artifacts/channel1/config_update_in_envelope.pb -c channel1 -o orderer1.hypctt.com:7050 --tls --cafile $ORDERER_CA


<!-- Deploy Chaincode -->


peer lifecycle chaincode package basic.tar.gz --path ./chaincode --lang node --label basic1.0


peer lifecycle chaincode install basic.tar.gz


peer lifecycle chaincode approveformyorg --channelID channel1 --name basic -version 1.0 --package-id basic_1.0:1e629a516fe591a614bf0788705ee7d8bd96839f6c5f28c9bf67c2e9514374bf --sequence 1 --tls --cafile $ORDERER_CA


peer lifecycle chaincode commit --channelID channel1 --name basic --version 1.0 --sequence 1 -o orderer1.hypctt.com:7050  --tls --cafile $ORDERER_CA --peerAddresses peer1.org1.hypctt.com:8051 --tlsRootCertFiles $CORE_PEER_TLS_ROOTCERT_FILE  

peer lifecycle chaincode commit --channelID channel1 --name basic --version 1.0 --sequence 1 -o orderer1.hypctt.com:7050 --tls --cafile $ORDERER_CA --peerAddresses peer1.org1.hypctt.com:8051 --tlsRootCertFiles $CORE_PEER_TLS_ROOTCERT_FILE


peer lifecycle chaincode querycommitted --channelID channel1 --name basic

peer chaincode invoke -o orderer1.hypctt.com:7050 --tls --cafile $ORDERER_CA -C channel1 -n basic --isInit -c '{"Args":["InitLedger"]}'

peer chaincode invoke -o orderer1.hypctt.com:7050 --tls --cafile $ORDERER_CA -C channel1 -n basic -c '{"Args":["InitLedger"]}'

peer chaincode query -C channel1 -n basic -c '{"Args":["GetAllAssets"]}'
