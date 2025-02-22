import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./LandingPage";
import GenerateKeys from "./GenerateKeys";
import ReceiveFile from "./ReceiveFile";
import SendFile from "./SendFile"; // Import Send File page

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/generate-keys" element={<GenerateKeys />} />
        <Route path="/receive" element={<ReceiveFile />} />
        <Route path="/send" element={<SendFile />} /> {/* Add this line */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
