import { Route, Routes } from "react-router-dom";
import { NavBar } from "./components/NavBar";
import { Footer } from "./components/Footer";
import { HomePage } from "./pages/Home/HomePage";
import { DiscoverPage } from "./pages/Discover/DiscoverPage";
import { AnalyzePage } from "./pages/Analyze/AnalyzePage";
import { LeaderboardPage } from "./pages/Leaderboard/LeaderboardPage";
import { NotFoundPage } from "./pages/NotFound/NotFoundPage";

export default function App() {
  return (
    <>
      <NavBar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/analyze/:platform/:username" element={<AnalyzePage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
