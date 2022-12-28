import 'bootstrap/dist/css/bootstrap.css';

import type { AppContext, AppProps } from 'next/app';

import buildClient from '../api/build-client';
import Header from '../components/header';
import { User } from '../models/User';

function App({ Component, pageProps, user }: AppProps & { user?: User }) {
  return (
    <>
      <Header user={user} />
      <Component {...pageProps} />
    </>
  );
}

App.getInitialProps = async (appContext: AppContext) => {
  try {
    const client = buildClient(appContext.ctx);
    const response = await client.get<User>('/api/users/current-user');
    const pageProps = await appContext.Component.getInitialProps?.(
      appContext.ctx,
    );

    return { pageProps, user: response.data };
  } catch (error) {
    return { user: undefined };
  }
};

export default App;
