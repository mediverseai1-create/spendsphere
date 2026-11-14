import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'SpendSphere: spend control for growing teams', template: '%s | SpendSphere' },
  description: 'Virtual cards, spend policies, live budgets and bill approvals in one workspace, with AI that explains your numbers.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
