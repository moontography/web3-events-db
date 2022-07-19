import assert from 'assert'
import ContractEventReader, {
  IContractEventReaderOptionsOptional,
} from './libs/ContractEventReader'
import BuiltInConnectors, { ConnectorType } from './libs/connectors'
import { IDatabaseConnector } from './libs/connectors/IDatabaseConnector'

interface Db {
  raw?: IDatabaseConnector
  type?: ConnectorType
  connectionString?: string
}

interface Options {
  db: Db
  contract: IContractEventReaderOptionsOptional
  onData?: (record: string) => void | Promise<void>
}

export default function Web3EventsDb({ db, contract, onData }: Options) {
  let connector: IDatabaseConnector
  if (db.raw) {
    connector = db.raw
  } else {
    assert(
      db.type && db.connectionString,
      'must have raw connector or built-in connector configuration'
    )
    connector = BuiltInConnectors[db.type](db.connectionString)
  }

  const reader = ContractEventReader({
    ...contract,
    async onData(record) {
      const fieldValues = record.returnValues
      const sanitizedRecord = Object.keys(fieldValues)
        .filter((col) => isNaN(parseInt(col)))
        .reduce((obj, col) => ({ ...obj, [col]: fieldValues[col] }), {})
      await connector.writeRecord(contract.eventName, sanitizedRecord)
      if (onData) {
        await onData(record)
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
