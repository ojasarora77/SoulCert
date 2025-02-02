import UniversityCertificateABI from "@my-app/contracts/src/abis/UniversityCertificate.json";
import { aiService } from '@my-app/react-app/src/services/aiService';
import React, { useEffect, useState, useMemo } from "react"; 
import { Contract } from "@ethersproject/contracts";
import { useEthers } from "@usedapp/core"; 
import { ethers } from 'ethers';
import styled from 'styled-components';

// Styled Components
const AppContainer = styled.div`
  min-height: 100vh;
  background: #13141a;
  color: white;
  font-family: 'Inter', sans-serif;
`;

const MainHeader = styled.div`
  padding: 24px 32px;
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  background: linear-gradient(90deg, #3B82F6, #10B981);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

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

const WelcomeSection = styled.div`
  max-width: 800px;
  margin: 80px auto;
  text-align: center;
  padding: 0 20px;
`;

const WelcomeTitle = styled.h2`
  font-size: 32px;
  margin-bottom: 16px;
  background: linear-gradient(90deg, #3B82F6, #10B981);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const WelcomeText = styled.p`
  font-size: 18px;
  color: #94A3B8;
  margin-bottom: 32px;
`;

const ContentSection = styled.div`
  max-width: 1200px;
  margin: 40px auto;
  padding: 32px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const FileInput = styled.input`
  background: rgba(255, 255, 255, 0.05);
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  margin-bottom: 10px;
`;

const DashboardTitle = styled.h2`
  font-size: 24px;
  margin-bottom: 24px;
  color: white;
`;

// Contract Configuration
const CONTRACT_ADDRESS = "0xEC1436e5C911ae8a53066DF5E1CC79A9d8F8A789";

// Components
function WalletButton() {
  const { account, activateBrowserWallet, deactivate } = useEthers();

  return (
    <Button
      onClick={() => {
        if (!account) {
          activateBrowserWallet();
        } else {
          deactivate();
        }
      }}
    >
      {!account ? "Connect Wallet" : `${account.slice(0, 6)}...${account.slice(-4)}`}
    </Button>
  );
}

function CertificateUpload({ account, contract }) {
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    // Add certificate upload logic here
  };

  return (
    <div>
      <DashboardTitle>Upload Certificate</DashboardTitle>
      <UploadForm onSubmit={handleSubmit}>
        <FileInput 
          type="file" 
          onChange={(e) => setFile(e.target.files[0])}
          accept=".pdf,.jpg,.jpeg,.png"
        />
        <Button type="submit">Upload & Verify</Button>
      </UploadForm>
    </div>
  );
}

function CertificateList({ account, contract }) {
  const [certificates, setCertificates] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCertificateUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;
  
    try {
      // Show loading state
      setIsLoading(true);
  
      // Step 1: AI Verification
      const verificationResult = await aiService.verifyCertificate(uploadFile);
      
      if (!verificationResult.isValid) {
        alert('Certificate validation failed');
        return;
      }
  
      // Step 2: Mint SBT
      const tx = await contract.mintScannedCertificate(
        account,
        verificationResult.hash,
        verificationResult.scanHash
      );
      await tx.wait();
      alert('Certificate verified and minted successfully!');
    } catch (error) {
      console.error("Error:", error);
      alert('Error processing certificate');
    } finally {
      setIsLoading(false);
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
          <Button type="submit" disabled={!uploadFile || isLoading}>
            {isLoading ? 'Processing...' : 'Convert to SBT'}
          </Button>
        </UploadForm>
      )}
    </div>
  );
}

const UniversityDashboard = ({ account, contract }) => (
  <div>
    <DashboardTitle>University Dashboard</DashboardTitle>
    <CertificateUpload account={account} contract={contract} />
  </div>
);

const StudentDashboard = ({ account, contract }) => (
  <div>
    <CertificateList account={account} contract={contract} />
  </div>
);

function App() {
  const { account, activateBrowserWallet } = useEthers();  // Get activateBrowserWallet here
  const [isUniversity, setIsUniversity] = useState(false);

  const contract = useMemo(() => {
    if (!window.ethereum) return null;
    return new Contract(
      CONTRACT_ADDRESS,
      UniversityCertificateABI,
      new ethers.providers.Web3Provider(window.ethereum).getSigner()
    );
  }, []);

  useEffect(() => {
    const checkRole = async () => {
      if (!account || !contract) return;
      try {
        const UNIVERSITY_ROLE = await contract.UNIVERSITY_ROLE();
        const hasRole = await contract.hasRole(UNIVERSITY_ROLE, account);
        setIsUniversity(hasRole);
      } catch (error) {
        console.error("Error checking university role:", error);
      }
    };

    checkRole();
  }, [account, contract]);

  return (
    <AppContainer>
      <MainHeader>
        <Title>University Certificate Verification</Title>
        <WalletButton />
      </MainHeader>
      
      {!account ? (
        <WelcomeSection>
          <WelcomeTitle>Welcome to Certificate Verification</WelcomeTitle>
          <WelcomeText>
            Connect your wallet to manage and verify university certificates on the blockchain.
          </WelcomeText>
          <Button onClick={activateBrowserWallet}>  {/* Use it directly here */}
            Connect Wallet
          </Button>
        </WelcomeSection>
      ) : (
        <ContentSection>
          {isUniversity ? (
            <UniversityDashboard account={account} contract={contract} />
          ) : (
            <StudentDashboard account={account} contract={contract} />
          )}
        </ContentSection>
      )}
    </AppContainer>
  );
}

export default App;