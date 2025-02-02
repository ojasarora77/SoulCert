import React from 'react';
import styled from 'styled-components';
import { useEthers } from '@usedapp/core';

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(10px);
`;

const Title = styled.h1`
  font-size: 24px;
  background: linear-gradient(90deg, #3B82F6, #10B981);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

export default function Header() {
  const { account } = useEthers();
  
  return (
    <HeaderContainer>
      <Title>University Certificate Verification</Title>
      <div>
        {account && <span>{account.slice(0, 6)}...{account.slice(-4)}</span>}
      </div>
    </HeaderContainer>
  );
}