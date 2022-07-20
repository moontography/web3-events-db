export interface IStringMap {
  [key: string]: any
}

export type IDatabaseConnectorFactory = (
  connectionString: string, // built-in connector connection string
  tableName?: null | string, // overriden table name for built-in connector we populating records for
  extraOptions?: any // connection options to override or add to built-in database connector connection
) => IDatabaseConnector

export interface IDatabaseConnector {
  isConnected?: boolean
  connect?: () => Promise<void>
  writeRecord: (eventName: string, keyValuePairs: IStringMap) => Promise<any>
}
