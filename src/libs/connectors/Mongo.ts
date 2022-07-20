import { MongoClient, ServerApiVersion } from 'mongodb'
import { IDatabaseConnector, IStringMap } from './IDatabaseConnector'

// connectionString ex: 'mongodb+srv://<connection string>/?retryWrites=true&w=majority'
export default function Mongo(
  connectionString: string,
  tableName?: null | string,
  extraOptions?: IStringMap
): IDatabaseConnector {
  const dbClient = new MongoClient(connectionString, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
    ...extraOptions,
  })

  return {
    isConnected: false,

    async connect() {
      await dbClient.connect()
      this.isConnected = true
    },

    async writeRecord(eventName: string, record: IStringMap) {
      if (!this.isConnected && this.connect) {
        await this.connect()
      }

      const database = dbClient.db('web3EventsDb')
      const collection = database.collection(tableName || eventName)
      await collection.insertOne(record)
    },
  }
}
