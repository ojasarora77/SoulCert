import React, { useState } from 'react';
import styled from 'styled-components';

const VerifyForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 500px;
`;

const VerifyResult = styled.div`
  margin-top: 20px;
  padding: 20px;
  border-radius: 8px;
  background: ${props => props.isValid ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
  border: 1px solid ${props => props.isValid ? '#10B981' : '#EF4444'};
`;

export default function CertificateVerify({ contract }) {
  const [certificateId, setCertificateId] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const certificate = await contract.getCertificate(certificateId);
      setVerificationResult(certificate);
    } catch (error) {
      console.error("Error verifying certificate:", error);
      setVerificationResult(null);
    }
  };

  return (
    <div>
      <h2>Verify Certificate</h2>
      <VerifyForm onSubmit={handleVerify}>
        <input
          type="text"
          placeholder="Enter Certificate ID"
          value={certificateId}
          onChange={(e) => setCertificateId(e.target.value)}
        />
        <Button type="submit">Verify</Button>
      </VerifyForm>

      {verificationResult && (
        <VerifyResult isValid={verificationResult.isValid}>
          <h3>Verification Result</h3>
          <p>Status: {verificationResult.isValid ? "Valid" : "Invalid"}</p>
          <p>Issuing University: {verificationResult.university}</p>
          <p>Issue Date: {new Date(verificationResult.issueDate * 1000).toLocaleDateString()}</p>
        </VerifyResult>
      )}
    </div>
  );
}