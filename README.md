# web3-events-db

Easily store blockchain events from smart contracts to a database
of your choice without doing all the painful scaffolding.

## Install

```sh
$ npm install -s web3-events-db
```

## Built-in Database Connectors

Please add an [issue](https://github.com/moontography/web3-events-db/issues) for any common, modern DB you'd like us to support with a built-in connector.

- PostgreSQL
- MongoDB

## Supported block explorers to fetch verified contracts

Please add an [issue](https://github.com/moontography/web3-events-db/issues) for any block explorers you'd like us to support.

- Etherscan (ETH)
- BscScan (BSC)

## Usage

We will build out detailed API docs over time. In the meantime, review the below examples and
see [Examples](https://github.com/moontography/web3-events-db/blob/master/src/examples) for good small
example scripts to get you started.

### Example 1: BSC verified contract to PostgreSQL DB

```ts
import web3EventsDb from 'web3-events-db'

// listen for events for a bscscan verified BSC contract and populate a postgres database
// listening on localhost and in default table `Predict_web3_events_db` (`${eventName}_web3_events_db`)
const readerWriter = Web3EventsDb({
  db: {
    type: 'postgres',
    connectionString: 'postgres://localhost:5432/web3',
  },
  contract: {
    network: 'bsc',
    blockExplorerApiKey: process.env.BSCSCAN_API_KEY,
    wsRpc: `wss://apis-sj.ankr.com/wss/${process.env.ANKR_INSTANCE}/${process.env.ANKR_API_KEY}/binance/full/main`,
    contract: '0x20D0a1831c0F5071904a5EC511423564793bf620',
    eventName: 'Predict',
  },
  recordCallback: (record) => console.log('got a record', record),
})
await readerWriter.start()
```

### Example 2: ETH verified contract to MongoDB

```ts
import web3EventsDb from 'web3-events-db'

// listen for events for a bscscan verified BSC contract and populate a MongoDB database
// listening on localhost and in default table `Predict_web3_events_db` (`${eventName}_web3_events_db`)
const readerWriter = Web3EventsDb({
  db: {
    type: 'mongo',
    connectionString: 'mongodb://localhost/?retryWrites=true&w=majority',
  },
  contract: {
    network: 'eth',
    blockExplorerApiKey: process.env.ETHERSCAN_API_KEY,
    wsRpc: `wss://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
    contract: '0x20D0a1831c0F5071904a5EC511423564793bf620',
    eventName: 'Predict',
  },
  recordCallback: (record) => console.log('got a record', record),
})
await readerWriter.start()
```

### Example 3: BSC contract w/ custom passed ABI to PostgreSQL DB

TODO

### Example 3: BSC verified contract to PostgreSQL DB with overriden table name

TODO

### Example 3: BSC verified contract to custom DB connector

TODO

## Testing

Tests depend on active database connections on localhost for all
built-in connectors (mongodb and postgres).

```sh
$ npm test
```
