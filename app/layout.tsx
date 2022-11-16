import { Header } from '../components/Header';
import RootStyleRegistry from './emotion';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US">
      <head>
        <title>Dystopian Attendance</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
        <link rel="shortcut icon" href="/favicon.svg" />
      </head>
      <body>
        <RootStyleRegistry>
          <Header />
          {children}
        </RootStyleRegistry>
      </body>
    </html>
  );
}
