import { useState } from "react";
import { generateRSAKeyPair } from "./utils/cryptoUtils";

export default function GenerateKeys() {
  const [keys, setKeys] = useState({ publicKey: "", privateKey: "" });

  const handleGenerateKeys = async () => {
    const generatedKeys = await generateRSAKeyPair();
    setKeys(generatedKeys);
  };

  return (
    <div className="p-4 text-center">
      <h2 className="text-xl font-bold mb-4">Generate RSA Key Pair</h2>
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded"
        onClick={handleGenerateKeys}
      >
        Generate Keys
      </button>

      {keys.publicKey && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Public Key:</h3>
          <textarea readOnly value={keys.publicKey} className="w-full p-2 border rounded" />

          <h3 className="text-lg font-semibold mt-2">Private Key:</h3>
          <textarea readOnly value={keys.privateKey} className="w-full p-2 border rounded" />
        </div>
      )}
    </div>
  );
}
