import React from 'react';
import styled from 'styled-components';
import CertificateUpload from '../certificates/CertificateUpload';
import RoleManagement from './RoleManagement';

const Dashboard = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  padding: 20px;
`;

export default function UniversityDashboard({ contract, account }) {
  return (
    <Dashboard>
      <div>
        <h2>Issue Certificates</h2>
        <CertificateUpload contract={contract} account={account} />
      </div>
      <div>
        <h2>Manage Roles</h2>
        <RoleManagement contract={contract} account={account} />
      </div>
    </Dashboard>
  );
}