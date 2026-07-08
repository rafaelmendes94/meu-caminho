import { Navigate } from "react-router-dom";
import HomeScreen from "./HomeScreen";

const AuthGate = () => {
  const authed = typeof window !== "undefined" && localStorage.getItem("mc_authed") === "1";
  if (!authed) return <Navigate to="/login" replace />;
  return <HomeScreen />;
};

export default AuthGate;
