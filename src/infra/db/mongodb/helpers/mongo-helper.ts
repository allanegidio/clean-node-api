import { Collection, MongoClient } from 'mongodb'

export const MongoHelper = {

  // You can't cast from a custom to a primitive without 'erasing' the type first. unknown erases the type checking.
  client: null as unknown as MongoClient,
  uri: null as unknown as string,

  async connect (uri: string): Promise<void> {
    this.uri = uri
    this.client = await MongoClient.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
  },

  async disconnect (): Promise<void> {
    await this.client.close()
    this.client = null as unknown as MongoClient
  },

  async getCollection (name: string): Promise<Collection> {
    // if (!this.client || !this.client.isConnected()) -> Old javascript xD
    if (!this.client?.isConnected()) {
      await this.connect(this.uri)
    }

    return this.client.db().collection(name)
  },

  map (model: any): any {
    const { _id, ...modelWithoutId } = model
    return Object.assign({}, modelWithoutId, { id: _id })
  }
}
