import { NextFunction, Request, Response } from 'express';
import { SettingsDAL } from '../dal/settings.dal';

export const createGetSettingsController =
  ({ settingsDAL }: { settingsDAL: SettingsDAL }) =>
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const settings = await settingsDAL.getSettings();
      if (!settings) {
        res.status(404).json({ message: 'Settings not found' });
        return;
      }
      res.json(settings);
    } catch (error) {
      next(error);
    }
  };
