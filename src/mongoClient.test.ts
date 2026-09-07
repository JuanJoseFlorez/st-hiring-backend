import { MongoClient } from 'mongodb';
import { createMongoClient } from './mongoClient';

jest.mock('mongodb');

describe('createMongoClient', () => {
  it('constructs a MongoClient with the given uri', () => {
    const uri = 'mongodb://localhost:27017';

    const client = createMongoClient(uri);

    expect(MongoClient).toHaveBeenCalledWith(uri);
    expect(client).toBeInstanceOf(MongoClient);
  });
});
