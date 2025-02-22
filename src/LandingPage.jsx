import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Secure File Sharing</h1>
      <div className="space-x-4">
        <button 
          className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
          onClick={() => navigate("/send")}
        >
          Send File
        </button>
        <button 
          className="px-6 py-3 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600"
          onClick={() => navigate("/receive")}
        >
          Receive File
        </button>
      </div>
    </div>
  );
}
