import assert from 'assert'
import ContractEventReader, {
  IContractEventReaderOptionsOptional,
} from './libs/ContractEventReader'
import BuiltInConnectors, { ConnectorType } from './libs/connectors'
import { IStringMap } from './libs/connectors/IDatabaseConnector'
import { IDatabaseConnector } from './libs/connectors/IDatabaseConnector'

interface Db {
  raw?: IDatabaseConnector // custom connector to use to store event data to (NO OTHER OPTIONS BELOW ARE USED IF THIS IS PROVIDED)
  type?: ConnectorType // built-in connector type
  tableName?: string // override DB table name to populate in connector provided
  connectionString?: string // connecting string for built-in connector
  extraConfig?: IStringMap // any extra configuration to add to a built-in connector connection
}

interface Options {
  db: Db
  contract: IContractEventReaderOptionsOptional
  recordCallback?: (record: IStringMap) => void | Promise<void>
}

export default function Web3EventsDb({
  db,
  contract,
  recordCallback,
}: Options) {
  let connector: IDatabaseConnector
  if (db.raw) {
    connector = db.raw
  } else {
    assert(
      db.type && db.connectionString,
      'must have raw connector or built-in connector configuration'
    )
    connector = BuiltInConnectors[db.type](
      db.connectionString,
      db.tableName,
      db.extraConfig
    )
  }

  const reader = ContractEventReader({
    ...contract,
    async onData(record) {
      const fieldValues = record.returnValues
      const sanitizedRecord = Object.keys(fieldValues)
        .filter((col) => isNaN(parseInt(col)))
        .reduce((obj, col) => ({ ...obj, [col]: fieldValues[col] }), {})
      await connector.writeRecord(contract.eventName, sanitizedRecord)
      if (recordCallback) {
        await recordCallback(record)
      }
    },
  })

  return {
    async start() {
      await reader.init()
      await reader.listen()
    },
  }
}
