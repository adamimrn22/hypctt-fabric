
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
osnadmin channel join --channelID orgonechannel --config-block ./channel-artifacts/org1/orgonechannel.block -o orderer1.hypctt.com:7053 --ca-file $ORDERER_CA --client-cert $ADMIN_CERT --client-key $ADMIN_KEY

check orderer channel list
osnadmin channel list -o orderer1.hypctt.com:7053 --ca-file $ORDERER_CA --client-cert $ADMIN_CERT --client-key $ADMIN_KEY 

# Join the peer to the channel
peer channel join -b ./channel-artifacts/org1/orgonechannel.block
 

 

 