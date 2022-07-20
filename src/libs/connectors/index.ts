import { IDatabaseConnectorFactory } from './IDatabaseConnector'
import Mongo from './Mongo'
import Postgres from './Postgres'

export type ConnectorType = 'mongo' | 'postgres'
export interface IConnectors {
  [key: string]: IDatabaseConnectorFactory
}

export default {
  mongo: Mongo,
  postgres: Postgres,
} as IConnectors
