import { useRouter } from 'next/router';
import { FormEvent, useState } from 'react';

import { HttpMethods } from '../../@types/http-methods';
import useRequest from '../../hooks/use-request';

export default function SignUp() {
  const router = useRouter();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const { doRequest, errors, loading } = useRequest({
    url: '/api/users/signin',
    method: HttpMethods.POST,
    body: { email, password },
    onSuccess: () => router.push('/'),
  });

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    doRequest();
  };

  return (
    <div className="container">
      <form onSubmit={onSubmit}>
        <h1>Sign In</h1>
        <div className="form-group">
          <label htmlFor="email">Email address</label>
          <input
            type="text"
            name="email"
            id="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            id="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {errors && errors.length > 0 && (
          <div className="alert alert-danger mt-2">
            <h4>Ooops...</h4>
            <ul>
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-2">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            Sign In
          </button>
        </div>
      </form>
    </div>
  );
}
