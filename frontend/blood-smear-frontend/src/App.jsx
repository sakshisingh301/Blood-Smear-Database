import { useNavigate } from "react-router-dom";
import UCDavisNavbar from "./Component/UCDavisNavbar";
import GoldBackgroundSection from "./Component/GoldBackgroundSection"; // Hero / search section
import AppInfoSection from "./Component/AppInfoSection";               // Stats + actions + audiences
import RecentUploadsSection from "./Component/RecentUploadsSection";   // Specimen gallery
import "./App.css";

// ── Minimal trust footer ──────────────────────────────────────────────────
const HomeFooter = () => {
  const navigate = useNavigate();
  return (
    <footer className="hp-footer">
      <div className="hp-footer__inner">
        <div className="hp-footer__brand">
          <span className="hp-footer__brand-name">Blood Smear Image Database</span>
          <span className="hp-footer__brand-org">
            UC Davis School of Veterinary Medicine
          </span>
        </div>
        <nav className="hp-footer__links" aria-label="Footer navigation">
          <button className="hp-footer__link" onClick={() => navigate('/species')}>Explore</button>
          <button className="hp-footer__link" onClick={() => navigate('/contribute')}>Contribute</button>
          <button className="hp-footer__link" onClick={() => navigate('/about')}>About</button>
          <button className="hp-footer__link" onClick={() => navigate('/login')}>Sign In</button>
        </nav>
        <p className="hp-footer__copy">
          © {new Date().getFullYear()} UC Davis Veterinary Medicine. Research use only.
        </p>
      </div>
    </footer>
  );
};

// ── Homepage ──────────────────────────────────────────────────────────────
function App() {
  return (
    <div className="app-container">
      <UCDavisNavbar />
      <GoldBackgroundSection />   {/* Hero with search */}
      <AppInfoSection />           {/* Stats · Action cards · Audiences */}
      <RecentUploadsSection />     {/* Specimen gallery */}
      <HomeFooter />
    </div>
  );
}

export default App;
