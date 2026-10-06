import { Route, Routes, useLocation } from "react-router-dom";
import { NavBar } from "./components/NavBar";
import { Footer } from "./components/Footer";
import { HomePage } from "./pages/Home/HomePage";
import { TestDetailPage } from "./pages/TestDetail/TestDetailPage";
import { WatchPage } from "./pages/Watch/WatchPage";
import { NotFoundPage } from "./pages/NotFound/NotFoundPage";

export default function App() {
  const location = useLocation();
  const isWatchPage = location.pathname.startsWith("/watch/");

  if (isWatchPage) {
    return (
      <Routes>
        <Route path="/watch/:id" element={<WatchPage />} />
      </Routes>
    );
  }

  return (
    <>
      <NavBar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tests/:id" element={<TestDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
