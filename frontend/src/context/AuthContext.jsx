import { createContext } from 'react';

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: () => {},
  logout: () => {}
});

export default AuthContext;