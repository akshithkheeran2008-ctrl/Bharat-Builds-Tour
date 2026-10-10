import { ScanCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAMES } from '../lib/dynamoClient.js';
import { buildResponse, errorResponse } from '../lib/response.js';

export async function handler(event) {
  try {
    const httpMethod = event.httpMethod || event.requestContext?.http?.method;
    const pathParameters = event.pathParameters || {};
    const zoneId = pathParameters.zoneId;

    if (zoneId) {
      // GET /zones/{zoneId}
      const command = new GetCommand({
        TableName: TABLE_NAMES.ZONES,
        Key: { id: zoneId }
      });
      const res = await docClient.send(command);
      if (!res.Item) {
        return errorResponse(404, `Zone with ID ${zoneId} not found.`);
      }
      return buildResponse(200, res.Item);
    }

    // GET /zones
    const command = new ScanCommand({
      TableName: TABLE_NAMES.ZONES
    });
    const res = await docClient.send(command);
    return buildResponse(200, res.Items || []);
  } catch (err) {
    console.error('Error in zones handler:', err);
    return errorResponse(500, 'Internal server error processing zones request.', [err.message]);
  }
}
