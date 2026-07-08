import HomeScreen from "./HomeScreen";
import ProtectedRoute from "./ProtectedRoute";

const AuthGate = () => (
  <ProtectedRoute>
    <HomeScreen />
  </ProtectedRoute>
);

export default AuthGate;
