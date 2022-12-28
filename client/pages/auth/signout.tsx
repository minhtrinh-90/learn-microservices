import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { HttpMethods } from '../../@types/http-methods';
import useRequest from '../../hooks/use-request';

function SignOut() {
  const router = useRouter();
  const { doRequest } = useRequest({
    url: '/api/users/signout',
    method: HttpMethods.POST,
    onSuccess: () => router.push('/'),
    onError: () => {
      document.cookie.split(';').forEach((c) => {
        document.cookie = c
          .replace(/^ +/, '')
          .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
      });
      router.push('/');
    },
  });

  useEffect(() => {
    doRequest();
  }, []);

  return <div>Signing you out...</div>;
}

export default SignOut;
