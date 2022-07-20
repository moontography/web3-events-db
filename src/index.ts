import assert from 'assert'
import ContractEventReader, {
  IContractEventReaderOptionsOptional,
} from './libs/ContractEventReader'
import BuiltInConnectors, { ConnectorType } from './libs/connectors'
import { IStringMap } from './libs/connectors/IDatabaseConnector'
import { IDatabaseConnector } from './libs/connectors/IDatabaseConnector'

interface Db {
  raw?: IDatabaseConnector
  type?: ConnectorType
  tableName?: string
  connectionString?: string
  extraConfig?: IStringMap
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
