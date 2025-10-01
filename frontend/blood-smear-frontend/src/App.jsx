import UCDavisNavbar from "./Component/UCDavisNavbar";
import GoldBackgroundSection from "./Component/GoldBackgroundSection";
import AppInfoSection from "./Component/AppInfoSection";
import RecentUploadsSection from "./Component/RecentUploadsSection";
import "./App.css";

function App() {
  return (
    <div className="app-container">
      <UCDavisNavbar />
      <GoldBackgroundSection />
      <AppInfoSection />
      <RecentUploadsSection />
    </div>
  );
}

export default App;
