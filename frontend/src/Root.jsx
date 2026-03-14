import { useState } from 'react'
import App from './App.jsx'
import Test from './test.jsx'

export default function Root() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  if (isLoggedIn) {
    return <App />;
  }
  return <Test onLoginSuccess={() => setIsLoggedIn(true)} />;
}
