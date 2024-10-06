import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../services/firebaseConfig.js';

const ProtectedRoute = ({ children }) => {
  const [user] = useAuthState(auth);

  if (!user) {
    return <div>Please login to access this page.</div>;
  }

  return children;
};

export default ProtectedRoute;
