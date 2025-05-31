// API Configuration
// Using CloudFront as a proxy for the API
// This solves the mixed content issue by serving both frontend and API over HTTPS
const API_BASE_URL = 'https://d1v9dmgp4scf60.cloudfront.net';
// const API_BASE_URL = 'http://184.72.168.62:5000';
// const API_BASE_URL = 'http://localhost:5000'; // For local development

export { API_BASE_URL };
