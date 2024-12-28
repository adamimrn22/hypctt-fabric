# update anchor peer
 peer channel fetch config channel-artifacts/config_block.pb -o orderer1.hypctt.com:7050 --ordererTLSHostnameOverride orderer1.hypctt.com -c channel1 --tls --cafile "$ORDERER_CA"

cd channel-artifacts/channel1


 

 peer channel update -f channel-artifacts/channel1/config_update_in_envelope.pb -c channel1 -o orderer1.hypctt.com:7050  --ordererTLSHostnameOverride orderer1.hypctt.com --tls --cafile "ORDERER_CA"



 peer channel fetch config ./channel-artifacts/channel1/config_block.pb -c $CHANNEL_NAME -o orderer1.hypctt.com:7050 --ordererTLSHostnameOverride orderer1.hypctt.com --tls --cafile "$ORDERER_CA"

 configtxlator proto_decode --input config_block.pb --type common.Block --output config_block.json
peer channel update -f channel-artifacts/channel1/config_update_in_envelope.pb -c channel1 -o orderer1.hypctt.com:7050 --tls --cafile $ORDERER_CA

 