function CertificateList({ account, contract }) {
  const [certificates, setCertificates] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);

  const handleCertificateUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;

    try {
      // Here we'll add the scanning and conversion logic
      // 1. First upload the file
      // 2. Use AI to verify it
      // 3. Convert to SBT

      // Placeholder for contract interaction
      const certificateHash = ethers.utils.id(uploadFile.name); // This is a placeholder
      const scanHash = ethers.utils.id('scan_' + uploadFile.name); // This is a placeholder

      const tx = await contract.mintScannedCertificate(
        account,
        certificateHash,
        scanHash
      );
      await tx.wait();
      alert('Certificate uploaded and converted to SBT!');
    } catch (error) {
      console.error("Error uploading certificate:", error);
      alert('Error uploading certificate');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Your Certificates</h2>
        <Button onClick={() => setShowUploadForm(!showUploadForm)}>
          Upload New Certificate
        </Button>
      </div>

      {showUploadForm && (
        <UploadForm onSubmit={handleCertificateUpload}>
          <div>
            <input
              type="file"
              onChange={(e) => setUploadFile(e.target.files[0])}
              accept=".pdf,.jpg,.jpeg,.png"
              style={{ marginBottom: '10px' }}
            />
            <p style={{ color: '#94A3B8', fontSize: '14px' }}>
              Upload your certificate to convert it to an SBT
            </p>
          </div>
          <Button type="submit" disabled={!uploadFile}>
            Convert to SBT
          </Button>
        </UploadForm>
      )}

      {/* Rest of your certificate list code */}
    </div>
  );
}

// Add these styled components
const Button = styled.button`
  background: #3B82F6;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #2563EB;
    transform: translateY(-2px);
  }

  &:disabled {
    background: #94A3B8;
    cursor: not-allowed;
  }
`;

const UploadForm = styled.form`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;