import './global.css';
import Providers from './providers';

export const metadata = {
  title: 'YellowBooks',
  description: 'YellowBooks directory',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#f9f9f9] text-neutral-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
