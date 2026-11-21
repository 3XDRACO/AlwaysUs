import './globals.css';
import Navbar from '../components/Navbar';

export const metadata = {
  title: 'AlwaysUs — Personalized AI Companion (Shakti)',
  description: 'Private, affectionate AI companion powered by Shakti.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="app-main">
          {children}
        </main>
      </body>
    </html>
  );
}
