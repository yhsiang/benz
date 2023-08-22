# NFT Portal

## Directory Structure

1. Smart contracts
   contracts/
   test/
   hardhat.config.ts
   package.json
   package-lock.json
   tsconfig.json

2. WebApp
   web-app/

3. API
   cmd/
   pkg/
   go.mod
   go.sum

## Prepare NFT metadata

**suggest to run local ipfs `$ ipfs daemon`**

1. Add image to IPFS `$ ipfs add file1.jpg`
2. Modify image url with prefix `https://ipfs.io/ipfs/` in metadata file:`file1.json`
3. Add metadata to IPFS `$ ipfs add file1.json`
4. Modify tokenURIs.json
5. Repeat step 1-5 for 5 times

if not using local ipfs, remember to remove IPFS_URL in `docker-compose.yaml`

## Run local hardhat and deploy smart contract

1. install dependencies `$ npm install``
2. run local node `$ npx hardhat node`
3. deploy smart contract `$ npx hardhat run --network localhost scripts/deploy.ts`
4. you will get the smart contract address
5. Modify CONTRACT_ADDRESS in `docker-compose.yaml` and value is from step 4

## Run services

We only support local hardhat node. Other networks could be added in `web-app/src/_app.tsx`

And consider this document https://wagmi.sh/react/providers/configuring-chains

`$ docker compose up`
Open browser and browse `http://localhost:3000`

## Development

1. prepare local postgres and create database `benz`
2. copy .env.sample to .env and modify those values
3. run backend `$ godotenv -f .env -- go run ./cmd/api/main.go`
4. modify `web-app/.env.local`
5. run frontend `$ npm run dev`

## Note

1. only test on local hardhat
2. `$ npm test` will run testcases for smart contract
3. `$ go test ./pkg/...` will run testcases for backend
   only check uniqueness
4. there are no tests for frontend
5. I used walletconnect and wagmi direclty, not using web3.js and ether.js
6. For 3i explantion
   I choose hash because receipt would be stored in smart contract. If we want to verify the value, using hash is easier. Encryption/Decryption may need to store some secrets or to exchange keys in the frontend.
