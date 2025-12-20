
export class BgRemoverAPI {
    constructor() {
      this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    }
  
    async removeBackground(file) {
      const formData = new FormData();
      formData.append('image', file);
  
      try {
        const response = await fetch(`${this.baseURL}/api/remove-background`, {
          method: 'POST',
          body: formData,
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to remove background');
        }
  
        return await response.json();
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    }
  
    async getImageDetails(publicId) {
      try {
        const response = await fetch(`${this.baseURL}/api/transformations/${publicId}`);
        
        if (!response.ok) {
          throw new Error('Failed to get image details');
        }
  
        return await response.json();
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    }
  
    async checkHealth() {
      try {
        const response = await fetch(`${this.baseURL}/api/health`);
        return await response.json();
      } catch (error) {
        console.error('Health check failed:', error);
        return { status: 'ERROR', error: error.message };
      }
    }
  }
  
  export const bgRemoverAPI = new BgRemoverAPI();