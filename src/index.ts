import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { knex } from 'knex';
import dbConfig from './knexfile';
import { createMongoClient } from './mongoClient';
import { createEventDAL } from './dal/events.dal';
import { createTicketDAL } from './dal/tickets.dal';
import { createSettingsDAL } from './dal/settings.dal';
import { createGetEventsController } from './controllers/get-events';
import { createGetSettingsController } from './controllers/get-settings';
import { createPostSettingsController } from './controllers/post-settings';

const Knex = knex(dbConfig.development);

const eventDAL = createEventDAL(Knex);
const TicketDAL = createTicketDAL(Knex);

const main = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI environment variable is not set');
  }

  const mongoClient = createMongoClient(mongoUri);
  await mongoClient.connect();
  const settingsDAL = createSettingsDAL(mongoClient.db('seetickets'));

  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/events', createGetEventsController({ eventsDAL: eventDAL, ticketsDAL: TicketDAL }));

  app.get('/settings', createGetSettingsController({ settingsDAL }));
  app.post('/settings', createPostSettingsController({ settingsDAL }));

  app.use('/', (_req, res) => {
    res.json({ message: 'Hello API' });
  });

  app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  });

  app.listen(3000, () => {
    console.log('Server Started');
  });
};

main().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
