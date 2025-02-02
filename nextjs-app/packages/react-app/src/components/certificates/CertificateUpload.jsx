import React, { useState } from 'react';
import styled from 'styled-components';

const UploadForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 500px;
`;

const Input = styled.input`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 12px;
  border-radius: 8px;
  color: white;
`;

const Button = styled.button`
  background: #3B82F6;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  
  &:hover {
    background: #2563EB;
  }
`;

export default function CertificateUpload({ contract, account }) {
  const [studentAddress, setStudentAddress] = useState('');
  const [certificateHash, setCertificateHash] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const tx = await contract.mintCertificate(studentAddress, certificateHash);
      await tx.wait();
      alert('Certificate minted successfully!');
    } catch (error) {
      console.error("Error minting certificate:", error);
      alert('Error minting certificate');
    }
  };

  return (
    <UploadForm onSubmit={handleSubmit}>
      <h2>Issue New Certificate</h2>
      <Input
        type="text"
        placeholder="Student Wallet Address"
        value={studentAddress}
        onChange={(e) => setStudentAddress(e.target.value)}
      />
      <Input
        type="text"
        placeholder="Certificate Hash"
        value={certificateHash}
        onChange={(e) => setCertificateHash(e.target.value)}
      />
      <Button type="submit">Issue Certificate</Button>
    </UploadForm>
  );
}