import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import Buttons from './components/Pages/Buttons';
import AddRelayForm from './components/Pages/AddRelayForm';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import { auth } from './services/firebaseConfig';
import { useRegisterSW } from 'virtual:pwa-register/react';

function PrivateRoute({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/login');  // Redirect to login if user is not authenticated
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return children;
}

function App() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  useEffect(() => {
    if (offlineReady) {
      console.log('Your app is ready to work offline');
    }
    if (needRefresh) {
      console.log('A new version of the app is available');
    }
  }, [offlineReady, needRefresh]);

  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Buttons />
              </PrivateRoute>
            }
          />
          <Route
            path="/add-relay"
            element={
              <PrivateRoute>
                <AddRelayForm />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
