import { Collection, MongoClient } from 'mongodb'

export const MongoHelper = {

  // You can't cast from a custom to a primitive without 'erasing' the type first. unknown erases the type checking.
  client: null as unknown as MongoClient,

  async connect (uri: string): Promise<void> {
    this.client = await MongoClient.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
  },

  async disconnect (): Promise<void> {
    await this.client.close()
  },

  getCollection (name: string): Collection {
    return this.client.db().collection(name)
  }
}
