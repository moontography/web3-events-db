import Mongo from './Mongo'
import Postgres from './Postgres'

export type ConnectorType = 'mongo' | 'postgres'

export default {
  mongo: Mongo,
  postgres: Postgres,
}
