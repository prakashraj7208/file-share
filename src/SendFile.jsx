import { useState } from "react";

export default function SendFile() {
  const [publicKey, setPublicKey] = useState("");
  const [aesKey, setAesKey] = useState(null);
  const [encryptedAesKey, setEncryptedAesKey] = useState(null);
  const [encryptedFile, setEncryptedFile] = useState(null);

  // Function to generate AES key
  const generateAesKey = async () => {
    const key = await window.crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
    const exportedKey = await window.crypto.subtle.exportKey("raw", key);
    setAesKey(new Uint8Array(exportedKey));
  };

  // Function to encrypt AES key using public key
  const encryptAesKey = async () => {
    if (!publicKey || !aesKey) {
      alert("Public key and AES key are required!");
      return;
    }

    try {
      const pubKeyBytes = new Uint8Array(
        atob(publicKey).split("").map((char) => char.charCodeAt(0))
      );

      const importedPublicKey = await window.crypto.subtle.importKey(
        "spki",
        pubKeyBytes,
        { name: "RSA-OAEP", hash: "SHA-256" },
        false,
        ["encrypt"]
      );

      const encryptedKey = await window.crypto.subtle.encrypt(
        { name: "RSA-OAEP" },
        importedPublicKey,
        aesKey
      );

      setEncryptedAesKey(new Uint8Array(encryptedKey));
      alert("AES key encrypted successfully!");
    } catch (error) {
      alert("Error encrypting AES key: " + error.message);
    }
  };

  // Function to encrypt file
  const handleFileEncryption = async (event) => {
    const file = event.target.files[0];
    if (!file || !aesKey) {
      alert("Please generate an AES key first!");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const fileData = new Uint8Array(e.target.result);
      const iv = window.crypto.getRandomValues(new Uint8Array(12));

      try {
        const cryptoKey = await window.crypto.subtle.importKey(
          "raw",
          aesKey,
          { name: "AES-GCM" },
          false,
          ["encrypt"]
        );

        const encryptedData = await window.crypto.subtle.encrypt(
          { name: "AES-GCM", iv },
          cryptoKey,
          fileData
        );

        const encryptedFileData = new Uint8Array([...iv, ...new Uint8Array(encryptedData)]);
        setEncryptedFile(encryptedFileData);
        alert("File encrypted successfully!");
      } catch (error) {
        alert("Error encrypting file: " + error.message);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Function to download encrypted AES key
  const downloadEncryptedAesKey = () => {
    if (!encryptedAesKey) {
      alert("No encrypted AES key available!");
      return;
    }

    const blob = new Blob([encryptedAesKey], { type: "application/octet-stream" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "encrypted_aes_key.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to download encrypted file
  const downloadEncryptedFile = () => {
    if (!encryptedFile) {
      alert("No encrypted file available!");
      return;
    }

    const blob = new Blob([encryptedFile], { type: "application/octet-stream" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "encrypted_file.enc";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 text-center">
      <h2 className="text-xl font-bold mb-4">Send & Encrypt File</h2>

      <textarea
        placeholder="Enter Receiver's Public Key"
        value={publicKey}
        onChange={(e) => setPublicKey(e.target.value)}
        className="w-full p-2 border rounded mb-4 text-xs"
      />

      <button
        onClick={generateAesKey}
        className="bg-green-500 text-white px-4 py-2 rounded mb-4"
      >
        Generate AES Key
      </button>

      {aesKey && <p className="text-sm text-green-600 mb-4">AES Key generated successfully!</p>}

      <button
        onClick={encryptAesKey}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Encrypt AES Key
      </button>

      {encryptedAesKey && (
        <>
          <p className="text-sm text-blue-600 mb-4">AES Key encrypted successfully!</p>
          <button
            onClick={downloadEncryptedAesKey}
            className="bg-gray-500 text-white px-4 py-2 rounded mb-4"
          >
            Download Encrypted AES Key
          </button>
        </>
      )}

      <input type="file" accept=".txt" onChange={handleFileEncryption} className="mb-4" />

      {encryptedFile && (
        <>
          <p className="text-sm text-red-600 mb-4">File encrypted successfully!</p>
          <button
            onClick={downloadEncryptedFile}
            className="bg-red-500 text-white px-4 py-2 rounded mb-4"
          >
            Download Encrypted File
          </button>
        </>
      )}
    </div>
  );
}
