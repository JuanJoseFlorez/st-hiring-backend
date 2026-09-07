import { Request, Response } from 'express';
import { createPostSettingsController } from './post-settings';
import { SettingsDAL } from '../dal/settings.dal';
import { Settings } from '../entity/settings';

describe('createPostSettingsController', () => {
  const buildRes = () => {
    const res: Partial<Response> = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
    return res as Response;
  };

  const buildDal = (saved: Settings) => ({
    getSettings: jest.fn(),
    upsertSettings: jest.fn().mockResolvedValue(saved),
  });

  const validBody = {
    siteName: 'Acme',
    supportEmail: 'support@acme.com',
    maxTicketsPerOrder: 4,
  };

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2024-06-01T00:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('upserts a canonical settings document with a server-generated updatedAt', async () => {
    const saved: Settings = { ...validBody, updatedAt: new Date('2024-06-01T00:00:00.000Z') };
    const settingsDAL = buildDal(saved);
    const controller = createPostSettingsController({ settingsDAL });
    const req = { body: { ...validBody, updatedAt: new Date('2000-01-01') } } as Request;

    await controller(req, buildRes());

    expect(settingsDAL.upsertSettings).toHaveBeenCalledWith({
      siteName: 'Acme',
      supportEmail: 'support@acme.com',
      maxTicketsPerOrder: 4,
      updatedAt: new Date('2024-06-01T00:00:00.000Z'),
    });
  });

  it('trims string fields and drops unknown fields before persisting', async () => {
    const saved: Settings = { ...validBody, updatedAt: new Date() };
    const settingsDAL = buildDal(saved);
    const controller = createPostSettingsController({ settingsDAL });
    const req = {
      body: { siteName: '  Acme  ', supportEmail: '  support@acme.com  ', maxTicketsPerOrder: 4, _id: 'hacked', extra: 'nope' },
    } as Request;

    await controller(req, buildRes());

    expect(settingsDAL.upsertSettings).toHaveBeenCalledWith({
      siteName: 'Acme',
      supportEmail: 'support@acme.com',
      maxTicketsPerOrder: 4,
      updatedAt: new Date('2024-06-01T00:00:00.000Z'),
    });
  });

  it('responds 200 with the saved settings', async () => {
    const saved: Settings = { ...validBody, updatedAt: new Date('2024-06-01T00:00:00.000Z') };
    const settingsDAL = buildDal(saved);
    const controller = createPostSettingsController({ settingsDAL });
    const req = { body: validBody } as Request;
    const res = buildRes();

    await controller(req, res);

    expect(res.status).not.toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(saved);
  });

  describe('validation', () => {
    const settingsDAL: SettingsDAL = {
      getSettings: jest.fn(),
      upsertSettings: jest.fn(),
    };
    const controller = createPostSettingsController({ settingsDAL });

    const expectRejected = async (body: unknown) => {
      const res = buildRes();
      await controller({ body } as Request, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid settings' });
      expect(settingsDAL.upsertSettings).not.toHaveBeenCalled();
    };

    beforeEach(() => jest.clearAllMocks());

    it('rejects a null body', () => expectRejected(null));
    it('rejects an array body', () => expectRejected([validBody]));
    it('rejects a non-object body', () => expectRejected('not an object'));
    it('rejects a missing siteName', () => expectRejected({ ...validBody, siteName: undefined }));
    it('rejects a blank siteName', () => expectRejected({ ...validBody, siteName: '   ' }));
    it('rejects a missing supportEmail', () => expectRejected({ ...validBody, supportEmail: undefined }));
    it('rejects a malformed supportEmail', () => expectRejected({ ...validBody, supportEmail: 'not-an-email' }));
    it('rejects a missing maxTicketsPerOrder', () => expectRejected({ ...validBody, maxTicketsPerOrder: undefined }));
    it('rejects a zero maxTicketsPerOrder', () => expectRejected({ ...validBody, maxTicketsPerOrder: 0 }));
    it('rejects a negative maxTicketsPerOrder', () => expectRejected({ ...validBody, maxTicketsPerOrder: -1 }));
    it('rejects a non-integer maxTicketsPerOrder', () => expectRejected({ ...validBody, maxTicketsPerOrder: 1.5 }));
  });
});
