export interface Settings {
  siteName: string;
  supportEmail: string;
  maxTicketsPerOrder: number;
  updatedAt: Date;
}

export type SettingsInput = Omit<Settings, 'updatedAt'>;
