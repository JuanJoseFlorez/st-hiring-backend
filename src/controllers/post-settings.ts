import { NextFunction, Request, Response } from 'express';
import { SettingsDAL } from '../dal/settings.dal';
import { Settings } from '../entity/settings';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ValidBody {
  siteName: string;
  supportEmail: string;
  maxTicketsPerOrder: number;
}

const isValidBody = (body: unknown): body is ValidBody => {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) return false;

  const { siteName, supportEmail, maxTicketsPerOrder } = body as Record<string, unknown>;

  if (typeof siteName !== 'string' || siteName.trim().length === 0) return false;
  if (typeof supportEmail !== 'string' || !EMAIL_REGEX.test(supportEmail.trim())) return false;
  if (typeof maxTicketsPerOrder !== 'number' || !Number.isSafeInteger(maxTicketsPerOrder) || maxTicketsPerOrder <= 0) {
    return false;
  }

  return true;
};

export const createPostSettingsController =
  ({ settingsDAL }: { settingsDAL: SettingsDAL }) =>
  async (req: Request, res: Response, next: NextFunction) => {
    if (!isValidBody(req.body)) {
      res.status(400).json({ message: 'Invalid settings' });
      return;
    }

    const settings: Settings = {
      siteName: req.body.siteName.trim(),
      supportEmail: req.body.supportEmail.trim(),
      maxTicketsPerOrder: req.body.maxTicketsPerOrder,
      updatedAt: new Date(),
    };

    try {
      const saved = await settingsDAL.upsertSettings(settings);
      res.json(saved);
    } catch (error) {
      next(error);
    }
  };
