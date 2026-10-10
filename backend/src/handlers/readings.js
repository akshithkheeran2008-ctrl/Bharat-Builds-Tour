import { ScanCommand, QueryCommand, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAMES } from '../lib/dynamoClient.js';
import { buildResponse, errorResponse } from '../lib/response.js';
import { calculateWaterBalance } from '../lib/balanceLogic.js';

export async function handler(event) {
  try {
    const httpMethod = event.httpMethod || event.requestContext?.http?.method;

    if (httpMethod === 'POST') {
      const body = event.body ? JSON.parse(event.body) : {};
      const balance = calculateWaterBalance(body);

      if (!balance.isComputable) {
        return errorResponse(400, 'Invalid reading input.', balance.validationErrors);
      }

      // Check duplicate for zoneId + date
      const getExisting = new GetCommand({
        TableName: TABLE_NAMES.READINGS,
        Key: {
          zoneId: body.zoneId,
          date: body.date
        }
      });
      const existing = await docClient.send(getExisting);
      if (existing.Item) {
        return errorResponse(409, `A reading for Zone ${body.zoneId} on ${body.date} already exists.`);
      }

      const readingId = `RD-${body.zoneId}-${Date.now().toString(36).toUpperCase()}`;
      const item = {
        id: readingId,
        zoneId: body.zoneId,
        date: body.date,
        waterSupplied: Number(body.waterSupplied),
        recordedConsumption: Number(body.recordedConsumption),
        storageChange: Number(body.storageChange),
        otherDocumentedOutflows: Number(body.otherDocumentedOutflows || 0),
        unexplainedDifference: balance.unexplainedDifference,
        discrepancyPercentage: balance.discrepancyPercentage,
        classification: balance.classification,
        severity: balance.severity,
        status: balance.severity === 'HIGH' ? 'ANOMALY_DETECTED' : 'NORMAL',
        notes: body.notes || '',
        createdAt: new Date().toISOString()
      };

      await docClient.send(new PutCommand({
        TableName: TABLE_NAMES.READINGS,
        Item: item
      }));

      // Automatically create investigation if high discrepancy
      let createdInvestigation = null;
      if (balance.severity === 'HIGH' && balance.discrepancyPercentage > 15) {
        const invId = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        createdInvestigation = {
          id: invId,
          zoneId: item.zoneId,
          readingDate: item.date,
          readingId: item.id,
          title: `Auto-Detected Discrepancy in ${item.zoneId} (${balance.discrepancyPercentage}%)`,
          unexplainedDifference: balance.unexplainedDifference,
          discrepancyPercentage: balance.discrepancyPercentage,
          priority: balance.discrepancyPercentage > 25 ? 'Critical' : 'High',
          priorityReason: `Unexplained difference of ${balance.discrepancyPercentage}% exceeds operational threshold.`,
          status: 'Open',
          assignedOperator: 'Unassigned',
          createdAt: new Date().toISOString()
        };

        await docClient.send(new PutCommand({
          TableName: TABLE_NAMES.INVESTIGATIONS,
          Item: createdInvestigation
        }));
      }

      return buildResponse(201, {
        reading: item,
        balance,
        createdInvestigation
      });
    }

    // GET /readings
    const queryParams = event.queryStringParameters || {};
    const zoneId = queryParams.zoneId;

    let items = [];
    if (zoneId && zoneId !== 'ALL') {
      const command = new QueryCommand({
        TableName: TABLE_NAMES.READINGS,
        KeyConditionExpression: 'zoneId = :z',
        ExpressionAttributeValues: { ':z': zoneId }
      });
      const res = await docClient.send(command);
      items = res.Items || [];
    } else {
      const command = new ScanCommand({
        TableName: TABLE_NAMES.READINGS
      });
      const res = await docClient.send(command);
      items = res.Items || [];
    }

    // Sort descending by date
    items.sort((a, b) => new Date(b.date) - new Date(a.date));
    return buildResponse(200, items);
  } catch (err) {
    console.error('Error in readings handler:', err);
    return errorResponse(500, 'Internal server error processing readings.', [err.message]);
  }
}
