import { useState } from "react";

export default function ReceiveFile() {
  const [publicKey, setPublicKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [encryptedAesKey, setEncryptedAesKey] = useState(null);
  const [aesKey, setAesKey] = useState(null);
  const [encryptedFile, setEncryptedFile] = useState(null);
  const [decryptedFile, setDecryptedFile] = useState(null);

  // Function to generate RSA key pair
  const generateKeys = async () => {
    try {
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: "RSA-OAEP",
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
      );

      // Export public key
      const exportedPublicKey = await window.crypto.subtle.exportKey(
        "spki",
        keyPair.publicKey
      );
      const pubKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(exportedPublicKey)));

      // Export private key
      const exportedPrivateKey = await window.crypto.subtle.exportKey(
        "pkcs8",
        keyPair.privateKey
      );
      const privKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(exportedPrivateKey)));

      setPublicKey(pubKeyBase64);
      setPrivateKey(privKeyBase64);
      alert("Key pair generated successfully!");
    } catch (error) {
      alert("Error generating keys: " + error.message);
    }
  };

  // Handle AES key file upload
  const handleEncryptedAesKeyUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setEncryptedAesKey(new Uint8Array(e.target.result));
    };
    reader.readAsArrayBuffer(file);
  };

  // Handle encrypted file upload
  const handleEncryptedFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setEncryptedFile(new Uint8Array(e.target.result));
    };
    reader.readAsArrayBuffer(file);
  };

  // Decrypt AES key using private key
  const decryptAesKey = async () => {
    if (!privateKey || !encryptedAesKey) {
      alert("Private key and encrypted AES key are required!");
      return;
    }

    try {
      const privKeyBytes = new Uint8Array(
        atob(privateKey).split("").map((char) => char.charCodeAt(0))
      );

      const importedPrivateKey = await window.crypto.subtle.importKey(
        "pkcs8",
        privKeyBytes,
        { name: "RSA-OAEP", hash: "SHA-256" },
        false,
        ["decrypt"]
      );

      const decryptedKey = await window.crypto.subtle.decrypt(
        { name: "RSA-OAEP" },
        importedPrivateKey,
        encryptedAesKey
      );

      setAesKey(new Uint8Array(decryptedKey));
      alert("AES key decrypted successfully!");
    } catch (error) {
      alert("Error decrypting AES key: " + error.message);
    }
  };

  // Decrypt file using AES key
  const decryptFile = async () => {
    if (!aesKey || !encryptedFile) {
      alert("AES key and encrypted file are required!");
      return;
    }

    try {
      const iv = encryptedFile.slice(0, 12); // Extract IV (first 12 bytes)
      const encryptedData = encryptedFile.slice(12); // Extract encrypted file data

      const cryptoKey = await window.crypto.subtle.importKey(
        "raw",
        aesKey,
        { name: "AES-GCM" },
        false,
        ["decrypt"]
      );

      const decryptedData = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        cryptoKey,
        encryptedData
      );

      setDecryptedFile(new Uint8Array(decryptedData));
      alert("File decrypted successfully!");
    } catch (error) {
      alert("Error decrypting file: " + error.message);
    }
  };

  // Download decrypted file
  const downloadDecryptedFile = () => {
    if (!decryptedFile) {
      alert("No decrypted file available!");
      return;
    }

    const blob = new Blob([decryptedFile], { type: "text/plain" }); // Adjust MIME type if needed
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "decrypted_file.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 text-center">
      <h2 className="text-xl font-bold mb-4">Receive & Decrypt File</h2>

      {/* Generate Key Pair */}
      <button
        onClick={generateKeys}
        className="bg-purple-500 text-white px-4 py-2 rounded mb-4"
      >
        Generate Public & Private Key
      </button>

      {publicKey && (
        <div className="mb-4">
          <p className="text-sm text-green-600">Public Key Generated!</p>
          <textarea className="w-full p-2 border rounded text-xs" readOnly value={publicKey} />
          <p className="text-xs text-gray-500">Share this public key with the sender.</p>
        </div>
      )}

      {privateKey && (
        <div className="mb-4">
          <p className="text-sm text-red-600">Private Key Generated! (Keep this safe)</p>
          <textarea className="w-full p-2 border rounded text-xs" readOnly value={privateKey} />
        </div>
      )}

      {/* Input Private Key Manually */}
      <textarea
        placeholder="Enter Your Private Key"
        value={privateKey}
        onChange={(e) => setPrivateKey(e.target.value)}
        className="w-full p-2 border rounded mb-4 text-xs"
      />

      {/* Upload Encrypted AES Key */}
      <input type="file" onChange={handleEncryptedAesKeyUpload} className="mb-4" />
      {encryptedAesKey && <p className="text-sm text-blue-600 mb-4">AES Key uploaded!</p>}

      <button onClick={decryptAesKey} className="bg-green-500 text-white px-4 py-2 rounded mb-4">
        Decrypt AES Key
      </button>

      {aesKey && <p className="text-sm text-green-600 mb-4">AES Key decrypted successfully!</p>}

      {/* Upload Encrypted File */}
      <input type="file" onChange={handleEncryptedFileUpload} className="mb-4" />
      {encryptedFile && <p className="text-sm text-red-600 mb-4">Encrypted file uploaded!</p>}

      <button onClick={decryptFile} className="bg-blue-500 text-white px-4 py-2 rounded mb-4">
        Decrypt File
      </button>

      {decryptedFile && (
        <>
          <p className="text-sm text-green-600 mb-4">File decrypted successfully!</p>
          <button onClick={downloadDecryptedFile} className="bg-gray-500 text-white px-4 py-2 rounded mb-4">
            Download Decrypted File
          </button>
        </>
      )}
    </div>
  );
}
