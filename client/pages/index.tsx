import { NextPage } from 'next';

import buildClient from '../api/build-client';
import { User } from '../models/User';

const Home: NextPage<{ user?: User }> = ({ user }) => {
  return user ? <h1>You are signed in</h1> : <h1>You are NOT signed in</h1>;
};

Home.getInitialProps = async (context) => {
  try {
    const client = buildClient(context);
    const response = await client.get<User>('/api/users/current-user');

    return { user: response.data };
  } catch (error) {
    return { user: undefined };
  }
};

export default Home;
