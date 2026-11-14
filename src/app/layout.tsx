import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'SpendSphere | AI-native spend management for finance teams', template: '%s | SpendSphere' },
  description: 'An AI engine that analyzes every transaction, forecasts month-end spend and automates approvals through policy.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
