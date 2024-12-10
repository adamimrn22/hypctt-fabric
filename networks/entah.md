
nak run  docker-compose -f compose-files/orderers/orderer1-raft.yaml -f compose-files/peers/peersorg1.yaml up -d
nak down docker-compose -f compose-files/orderers/orderer1-raft.yaml -f compose-files/peers/peersorg1.yaml down --volumes --remove-orphans
<!-- # Set the environment for the peer connection
export CORE_PEER_ADDRESS=peer0.org1.hypctt.com:7051
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_TLS_CERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/crypto/peerOrganizations/org1.hypctt.com/peers/peer0.org1.hypctt.com/tls/server.crt
export CORE_PEER_TLS_KEY_FILE=/opt/gopath/src/github.com/hyperledger/fabric/crypto/peerOrganizations/org1.hypctt.com/peers/peer0.org1.hypctt.com/tls/server.key
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/crypto/peerOrganizations/org1.hypctt.com/peers/peer0.org1.hypctt.com/tls/ca.crt

export ORDERER_ADDRESS=orderer1.hypctt.com:7050
export ORDERER_TLS_CERT_FILE=/var/hyperledger/orderer/tls/server.crt
export ORDERER_TLS_KEY_FILE=/var/hyperledger/orderer/tls/server.key
export ORDERER_TLS_ROOTCERT_FILE=/var/hyperledger/orderer/tls/ca.crt -->

# Join the peer to the channel
peer channel join -b ./channel-artifacts/mychannel.block

# Set the channel configuration transaction file and update
peer channel update -o $ORDERER_ADDRESS -c $CHANNEL_NAME -f /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/mychannel_update.tx --tls --cafile $ORDERER_TLS_ROOTCERT_FILE


export ADMIN_CERT=/opt/gopath/src/github.com/hyperledger/fabric/crypto/ordererOrganizations/hypctt.com/users/Admin@hypctt.com/tls/client.crt

export ADMIN_KEY=/opt/gopath/src/github.com/hyperledger/fabric/crypto/ordererOrganizations/hypctt.com/users/Admin@hypctt.com/tls/client.key

docker exec -it cliorg1 bash

orderer join channel
osnadmin channel join --channelID mychannel --config-block ./channel-artifacts/mychannel.block -o orderer1.hypctt.com:7053 --ca-file $ORDERER_CA --client-cert $ADMIN_CERT --client-key $ADMIN_KEY

check orderer channel list
osnadmin channel list -o orderer1.hypctt.com:7053 --ca-file $ORDERER_CA --client-cert $ADMIN_CERT --client-key $ADMIN_KEY 