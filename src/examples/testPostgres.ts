require('dotenv').config()

import assert from 'assert'
import Web3EventsDb from '../'
;(async function () {
  assert(process.env.BSCSCAN_API_KEY, 'must have block explorer API key')
  const eventReaderWriter = Web3EventsDb({
    db: {
      type: 'postgres',
      connectionString: 'postgres://localhost:5432/web3',
    },
    contract: {
      network: 'bsc',
      blockExplorerApiKey: process.env.BSCSCAN_API_KEY,
      wsRpc: `wss://bsc.getblock.io/mainnet/?api_key=${process.env.GETBLOCK_API_KEY}`,
      contract: '0x20D0a1831c0F5071904a5EC511423564793bf620',
      eventName: 'Predict',
    },
    recordCallback: (record) => console.log('got a record', record),
  })
  await eventReaderWriter.start()
})()
