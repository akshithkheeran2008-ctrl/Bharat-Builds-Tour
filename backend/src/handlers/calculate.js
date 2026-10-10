import { buildResponse, errorResponse } from '../lib/response.js';
import { calculateWaterBalance } from '../lib/balanceLogic.js';

export async function handler(event) {
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const result = calculateWaterBalance(body);

    if (!result.isComputable) {
      return errorResponse(400, 'Reading data is incomplete or invalid.', result.validationErrors);
    }

    return buildResponse(200, result);
  } catch (err) {
    console.error('Error in calculate handler:', err);
    return errorResponse(500, 'Error calculating water balance.', [err.message]);
  }
}
