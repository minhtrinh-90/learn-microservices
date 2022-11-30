import { FormEvent, useState } from 'react';
import axios from 'axios';

export default function SignUp() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errors, setErrors] = useState<Array<string>>([]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      setErrors([]);
      const res = await axios.post('/api/users/signup', {
        email,
        password,
      });
      console.log(res);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrors(error.response?.data.message);
      }
      console.error(error);
    }
  };

  return (
    <div className="container">
      <form onSubmit={onSubmit}>
        <h1>Sign Up!</h1>
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
        {errors.length > 0 && (
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
          <button type="submit" className="btn btn-primary">
            Sign Up
          </button>
        </div>
      </form>
    </div>
  );
}
