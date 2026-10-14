import { Navigate, Route, Routes } from "react-router-dom";
import { SplashPage } from "./pages/SplashPage";
import { HomePage } from "./pages/HomePage";
import { CheckingPage } from "./pages/CheckingPage";
import { ResultPage } from "./pages/ResultPage";
import { HistoryPage } from "./pages/HistoryPage";
import { StatsPage } from "./pages/StatsPage";
import { SettingsPage } from "./pages/SettingsPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<SplashPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/checking" element={<CheckingPage />} />
      <Route path="/result/:id" element={<ResultPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/stats" element={<StatsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
