import './globals.css';

import { ReactQueryProvider } from './providers/ReactQueryProvider';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import 'antd/dist/reset.css';
import { getMessages } from 'next-intl/server';
import { cookies } from 'next/headers';
import { NextIntlClientProvider } from 'next-intl';
import { ConfigProvider } from 'antd';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value || 'en';

  const messages = await getMessages();
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AntdRegistry>
            <ReactQueryProvider>{children}</ReactQueryProvider>
          </AntdRegistry>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
