### Configuration folder

These are predefined configs for a network setup

- `single` is a network consisting of one node. Mostly used in dev-mode.
- `node0` and `node1` are for setting up a network of two nodes. Currently deployed on 5.157.85.76 and 5.157.85.181

The configuration is done in the `config/config.toml` file.

To understand the setup of a tendermint network it is recommended to read the quick start: https://tendermint.com/docs/introduction/quick-start.html#overview

When you create a new toml file using the tendermint generator, the framework requires the follwing modifications

- Increase the package payload according to your needs

`max_packet_msg_payload_size = 102400`

- Set index tag to enable notifications

`index_tags = "jv.contract"`

- Set the peers in a multinode environment

`persistent_peers = "7adfa7edbf0409faf64ea798a8e0beab3e08dbf7@5.157.85.76:26656,e9b2435d59ffe66abac2d410f0fed089d74affbd@5.157.85.181:26656"`

#### Multi-node network

Tendermint can help to generate genesis, node_key, priv_validator files by the following command

    `tendermint testnet`

Adjust the genesis file to match your network requirements, like unique networkid and intial set of validators

        {
          "genesis_time": "2018-09-09T12:30:12.328331783Z",
          "chain_id": "chain-no2Hxk",
          "validators": [
            {
              "pub_key": {
                "type": "tendermint/PubKeyEd25519",
                "value": "JH9umot+RbuSFH/XnUOlnOi4ovLfjADTtyloAT9mPp8="
              },
              "power": "1",
              "name": "node0"
            },
            {
              "pub_key": {
                "type": "tendermint/PubKeyEd25519",
                "value": "+VQ0X+9Ac47rpxVasaivu36UBXQ4s+wetUaykM+81gc="
              },
              "power": "1",
              "name": "node1"
            }
          ],
          "app_hash": ""
        }

On startup, the chosen config is copied to the `network` folder. Tendermint will use that folder to store the configuration and blockchain database files.
When starting the `app.js` server, you can set another location with the `-d` flag.

When the node is started it will remove the existing `network` folder, this will delete your chain data. This will also happen in a multi node environment,
only when a single node is restarted and the datafiles are cleared, the node will restore it self with blocked sent from other live nodes in the network.
The erase the complete chain you have to stop all nodes and restart all nodes one-by-one again.
