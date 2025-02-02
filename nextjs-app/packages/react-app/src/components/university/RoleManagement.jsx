import React, { useState } from 'react';
import styled from 'styled-components';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export default function RoleManagement({ contract }) {
  const [address, setAddress] = useState('');
  
  const addUniversity = async (e) => {
    e.preventDefault();
    try {
      const tx = await contract.addUniversity(address);
      await tx.wait();
      alert('University added successfully!');
    } catch (error) {
      console.error("Error adding university:", error);
      alert('Error adding university');
    }
  };

  return (
    <Form onSubmit={addUniversity}>
      <input
        type="text"
        placeholder="University Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <button type="submit">Add University</button>
    </Form>
  );
}