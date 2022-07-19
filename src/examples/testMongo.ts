require('dotenv').config()

import assert from 'assert'
import Web3EventsDb from '../'
;(async function () {
  assert(process.env.BSCSCAN_API_KEY, 'must have block explorer API key')
  const eventReaderWriter = Web3EventsDb({
    db: {
      type: 'mongo',
      connectionString: 'mongodb://localhost/?retryWrites=true&w=majority',
    },
    contract: {
      network: 'bsc',
      blockExplorerApiKey: process.env.BSCSCAN_API_KEY,
      wsRpc: `wss://bsc.getblock.io/mainnet/?api_key=${process.env.GETBLOCK_API_KEY}`,
      contract: '0x2bf6267c4997548d8de56087e5d48bdccb877e77',
      eventName: 'InitiatedCoinFlip',
    },
    onData: (record) => console.log('got a record', record),
  })
  await eventReaderWriter.start()
})()
