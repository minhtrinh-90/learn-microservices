import Link from 'next/link';

import { User } from '../models/User';

function Header({ user }: { user?: User }) {
  return (
    <nav className="navbar navbar-light bg-light">
      <Link href="/" className="navbar-brand">
        Get Tix
      </Link>
      <div className="d-flex justify-content-end">
        <ul className="nav d-flex align-items-center">
          {!user && (
            <li className="nav-item">
              <Link href="/auth/signup" className="nav-link">
                Sign Up
              </Link>
            </li>
          )}
          {!user && (
            <li className="nav-item">
              <Link href="/auth/signin" className="nav-link">
                Sign In
              </Link>
            </li>
          )}
          {!!user && (
            <li className="nav-item">
              <Link href="/auth/signout" className="nav-link">
                Sign Out
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Header;
