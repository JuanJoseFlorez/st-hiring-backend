import { Db } from 'mongodb';
import { Settings } from '../entity/settings';

const SETTINGS_ID = 'settings';

export interface SettingsDAL {
  getSettings(): Promise<Settings | null>;
  upsertSettings(settings: Settings): Promise<Settings>;
}

export const createSettingsDAL = (db: Db): SettingsDAL => {
  const collection = db.collection<{ _id: string } & Settings>('settings');

  return {
    async getSettings(): Promise<Settings | null> {
      const doc = await collection.findOne({ _id: SETTINGS_ID });
      if (!doc) return null;
      return {
        siteName: doc.siteName,
        supportEmail: doc.supportEmail,
        maxTicketsPerOrder: doc.maxTicketsPerOrder,
        updatedAt: doc.updatedAt,
      };
    },
    async upsertSettings(settings: Settings): Promise<Settings> {
      await collection.replaceOne(
        { _id: SETTINGS_ID },
        { _id: SETTINGS_ID, ...settings } as { _id: string } & Settings,
        { upsert: true },
      );
      return settings;
    },
  };
};
