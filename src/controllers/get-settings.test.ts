import { Request, Response } from 'express';
import { createGetSettingsController } from './get-settings';
import { SettingsDAL } from '../dal/settings.dal';
import { Settings } from '../entity/settings';

describe('createGetSettingsController', () => {
  const buildRes = () => {
    const res: Partial<Response> = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
    return res as Response;
  };

  it('responds 200 with the settings document when it exists', async () => {
    const settings: Settings = {
      siteName: 'Acme',
      supportEmail: 'a@b.com',
      maxTicketsPerOrder: 4,
      updatedAt: new Date('2024-01-01'),
    };
    const settingsDAL: SettingsDAL = {
      getSettings: jest.fn().mockResolvedValue(settings),
      upsertSettings: jest.fn(),
    };
    const controller = createGetSettingsController({ settingsDAL });
    const res = buildRes();

    await controller({} as Request, res);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(settings);
  });

  it('responds 404 when no settings document exists yet', async () => {
    const settingsDAL: SettingsDAL = {
      getSettings: jest.fn().mockResolvedValue(null),
      upsertSettings: jest.fn(),
    };
    const controller = createGetSettingsController({ settingsDAL });
    const res = buildRes();

    await controller({} as Request, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Settings not found' });
  });
});
