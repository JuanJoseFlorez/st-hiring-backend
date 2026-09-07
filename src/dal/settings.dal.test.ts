import { createSettingsDAL } from './settings.dal';
import { Settings } from '../entity/settings';

describe('createSettingsDAL', () => {
  const buildDb = (collectionMock: any) => ({
    collection: jest.fn().mockReturnValue(collectionMock),
  });

  describe('getSettings', () => {
    it('returns null when no settings document exists', async () => {
      const collectionMock = { findOne: jest.fn().mockResolvedValue(null) };
      const dal = createSettingsDAL(buildDb(collectionMock) as any);

      const result = await dal.getSettings();

      expect(result).toBeNull();
    });

    it('queries by the fixed singleton id', async () => {
      const collectionMock = { findOne: jest.fn().mockResolvedValue(null) };
      const dal = createSettingsDAL(buildDb(collectionMock) as any);

      await dal.getSettings();

      expect(collectionMock.findOne).toHaveBeenCalledWith({ _id: 'settings' });
    });

    it('strips _id from the returned document', async () => {
      const stored = {
        _id: 'settings',
        siteName: 'Acme',
        supportEmail: 'a@b.com',
        maxTicketsPerOrder: 4,
        updatedAt: new Date('2024-01-01'),
      };
      const collectionMock = { findOne: jest.fn().mockResolvedValue(stored) };
      const dal = createSettingsDAL(buildDb(collectionMock) as any);

      const result = await dal.getSettings();

      expect(result).not.toHaveProperty('_id');
      expect(result).toEqual({
        siteName: 'Acme',
        supportEmail: 'a@b.com',
        maxTicketsPerOrder: 4,
        updatedAt: stored.updatedAt,
      });
    });
  });

  describe('upsertSettings', () => {
    const settings: Settings = {
      siteName: 'Acme',
      supportEmail: 'a@b.com',
      maxTicketsPerOrder: 4,
      updatedAt: new Date('2024-01-01'),
    };

    it('replaces by the fixed singleton id with upsert enabled', async () => {
      const collectionMock = { replaceOne: jest.fn().mockResolvedValue({}) };
      const dal = createSettingsDAL(buildDb(collectionMock) as any);

      await dal.upsertSettings(settings);

      expect(collectionMock.replaceOne).toHaveBeenCalledWith(
        { _id: 'settings' },
        { _id: 'settings', ...settings },
        { upsert: true },
      );
    });

    it('returns the saved settings', async () => {
      const collectionMock = { replaceOne: jest.fn().mockResolvedValue({}) };
      const dal = createSettingsDAL(buildDb(collectionMock) as any);

      const result = await dal.upsertSettings(settings);

      expect(result).toEqual(settings);
    });
  });
});
