export interface IStringMap {
  [key: string]: any
}

export interface IDatabaseConnector {
  isConnected?: boolean
  connect?: () => Promise<void>
  writeRecord: (eventName: string, keyValuePairs: IStringMap) => Promise<any>
}
