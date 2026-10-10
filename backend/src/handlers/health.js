import { buildResponse } from '../lib/response.js';

export async function handler(event) {
  return buildResponse(200, {
    status: 'HEALTHY',
    service: 'AquaGen Water Black Box API',
    version: '1.0.0',
    region: process.env.AWS_REGION || 'us-east-1',
    timestamp: new Date().toISOString()
  });
}
