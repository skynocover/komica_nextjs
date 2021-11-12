import React from 'react';
import Head from 'next/head';
import type { AppProps } from 'next/app';
import { AppContext, AppProvider } from '../components/AppContext';
import '../styles/globals.css';
import 'tailwindcss/tailwind.css';
import 'font-awesome/css/font-awesome.min.css';
import 'antd/dist/antd.css';
// import '../mainstyle.css';
import '../styles/globals.css';

const MyApp = ({ Component, pageProps }: AppProps) => {
  React.useEffect(() => {}, []);

  return (
    <>
      <Head>
        <title>{process.env.NEXT_PUBLIC_HEAD_TITLE}</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <AppProvider>
        <Component {...pageProps} />
      </AppProvider>
    </>
  );
};

export default MyApp;
