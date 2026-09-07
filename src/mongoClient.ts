import { MongoClient } from 'mongodb';

export const createMongoClient = (uri: string): MongoClient => {
  return new MongoClient(uri);
};
