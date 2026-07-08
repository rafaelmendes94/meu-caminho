import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PreloaderScreen from "./PreloaderScreen";

const PreloaderRoute = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => navigate("/welcome", { replace: true }), 2800);
    return () => clearTimeout(t);
  }, [navigate]);
  return <PreloaderScreen />;
};

export default PreloaderRoute;
