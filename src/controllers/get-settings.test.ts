import { NextFunction, Request, Response } from 'express';
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

  const next: NextFunction = jest.fn();

  beforeEach(() => jest.clearAllMocks());

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

    await controller({} as Request, res, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(settings);
    expect(next).not.toHaveBeenCalled();
  });

  it('responds 404 when no settings document exists yet', async () => {
    const settingsDAL: SettingsDAL = {
      getSettings: jest.fn().mockResolvedValue(null),
      upsertSettings: jest.fn(),
    };
    const controller = createGetSettingsController({ settingsDAL });
    const res = buildRes();

    await controller({} as Request, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Settings not found' });
    expect(next).not.toHaveBeenCalled();
  });

  it('forwards the error to next when the DAL rejects', async () => {
    const error = new Error('Mongo unavailable');
    const settingsDAL: SettingsDAL = {
      getSettings: jest.fn().mockRejectedValue(error),
      upsertSettings: jest.fn(),
    };
    const controller = createGetSettingsController({ settingsDAL });
    const res = buildRes();

    await controller({} as Request, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.json).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
