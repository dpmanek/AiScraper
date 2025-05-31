// API Configuration
// Using HTTPS directly from the EC2 instance
// This solves the mixed content issue by serving the API over HTTPS
const API_BASE_URL = 'https://184.72.168.62:5001';
// const API_BASE_URL = 'http://184.72.168.62:5000'; // HTTP fallback
// const API_BASE_URL = 'http://localhost:5000'; // For local development

export { API_BASE_URL };
