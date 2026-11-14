import { Shell } from '@/components/Site';
export const metadata = { title: 'Contact' };
export default function Contact() {
  const email = process.env.CONTACT_EMAIL;
  return (
    <Shell>
      <div className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-4xl font-semibold tracking-tight">Contact us</h1>
        <p className="mt-4 text-ink-500">Questions about plans, security or Enterprise onboarding?</p>
        <div className="card mt-8 p-6">
          {email ? <p>Email <a className="font-semibold text-brand underline" href={`mailto:${email}`}>{email}</a></p> : <p className="text-ink-500">Support contact details will appear here once the <code>CONTACT_EMAIL</code> environment variable is set.</p>}
        </div>
      </div>
    </Shell>
  );
}
