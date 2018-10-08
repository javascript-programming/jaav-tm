### Install

Requires node 8+ (not tested with 10)

Install node packages and set execute permission

    npm i
    cd ./page
    npm i

    cd ..
    chmod +x ./run_node.sh

### Run

    Set configuration (folder name in configurations) + rpc port. Note: node0 and node1 are used for chain with two validators

    ./run_node.sh single 3000

Open Chrome console on http://localhost:3000/page





