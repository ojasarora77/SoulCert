const AI_ENDPOINT = 'http://localhost:5000'; // Your Python AI agent endpoint

export const aiService = {
  async verifyCertificate(file) {
    const formData = new FormData();
    formData.append('certificate', file);
    
    try {
      const response = await fetch(`${AI_ENDPOINT}/verify`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Verification failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('AI Verification Error:', error);
      throw error;
    }
  }
};