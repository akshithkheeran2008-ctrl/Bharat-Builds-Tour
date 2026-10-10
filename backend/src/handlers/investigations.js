import { ScanCommand, GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAMES } from '../lib/dynamoClient.js';
import { buildResponse, errorResponse } from '../lib/response.js';

export async function handler(event) {
  try {
    const httpMethod = event.httpMethod || event.requestContext?.http?.method;
    const pathParams = event.pathParameters || {};
    const investigationId = pathParams.investigationId;
    const path = event.path || event.requestContext?.http?.path || '';

    // POST /investigations/{investigationId}/inspections
    if (path.includes('/inspections') && httpMethod === 'POST') {
      const body = event.body ? JSON.parse(event.body) : {};
      const getRes = await docClient.send(new GetCommand({
        TableName: TABLE_NAMES.INVESTIGATIONS,
        Key: { id: investigationId }
      }));
      if (!getRes.Item) return errorResponse(404, `Investigation ${investigationId} not found.`);

      const inspection = {
        id: `INSP-${Date.now().toString(36).toUpperCase()}`,
        timestamp: body.timestamp || new Date().toISOString(),
        inspector: body.inspector || 'Utility Operator',
        type: body.type || 'Field Inspection',
        findings: body.findings || '',
        recommendation: body.recommendation || ''
      };

      const updatedInspections = [...(getRes.Item.inspections || []), inspection];
      await docClient.send(new UpdateCommand({
        TableName: TABLE_NAMES.INVESTIGATIONS,
        Key: { id: investigationId },
        UpdateExpression: 'SET inspections = :insps, #st = :st, updatedAt = :u',
        ExpressionAttributeNames: { '#st': 'status' },
        ExpressionAttributeValues: {
          ':insps': updatedInspections,
          ':st': getRes.Item.status === 'Open' ? 'Inspection Required' : getRes.Item.status,
          ':u': new Date().toISOString()
        }
      }));

      return buildResponse(200, { success: true, inspection });
    }

    // POST /investigations/{investigationId}/verify-comparison
    if (path.includes('/verify-comparison') && httpMethod === 'POST') {
      const body = event.body ? JSON.parse(event.body) : {};
      // Fetch before and after readings
      const [beforeRes, afterRes, invRes] = await Promise.all([
        docClient.send(new ScanCommand({
          TableName: TABLE_NAMES.READINGS,
          FilterExpression: 'id = :id',
          ExpressionAttributeValues: { ':id': body.beforeReadingId }
        })),
        docClient.send(new ScanCommand({
          TableName: TABLE_NAMES.READINGS,
          FilterExpression: 'id = :id',
          ExpressionAttributeValues: { ':id': body.afterReadingId }
        })),
        docClient.send(new GetCommand({
          TableName: TABLE_NAMES.INVESTIGATIONS,
          Key: { id: investigationId }
        }))
      ]);

      const beforeReading = beforeRes.Items?.[0];
      const afterReading = afterRes.Items?.[0];
      if (!beforeReading || !afterReading) {
        return errorResponse(400, 'Before and after readings must exist in DynamoDB.');
      }

      const beforeDiff = Number(beforeReading.unexplainedDifference || 0);
      const afterDiff = Number(afterReading.unexplainedDifference || 0);
      const delta = afterDiff - beforeDiff;
      const relativeImprovement = beforeDiff > 0 ? Number((((beforeDiff - afterDiff) / beforeDiff) * 100).toFixed(1)) : 0;
      const outcomeCategory = relativeImprovement >= 20 ? 'IMPROVED' : delta > 3000 ? 'WORSENED' : 'SIMILAR';

      const comparison = {
        actionTaken: body.actionTaken,
        technician: body.technician,
        beforeReadingId: body.beforeReadingId,
        afterReadingId: body.afterReadingId,
        beforeDiff,
        afterDiff,
        volumetricDeltaLpd: delta,
        relativeImprovementPercent: relativeImprovement,
        outcomeCategory,
        summary: `Discrepancy changed by ${delta.toLocaleString()} L/day (${relativeImprovement}% relative reduction).`
      };

      await docClient.send(new UpdateCommand({
        TableName: TABLE_NAMES.INVESTIGATIONS,
        Key: { id: investigationId },
        UpdateExpression: 'SET beforeAfterComparison = :bac, #st = :st, outcome = :out, updatedAt = :u',
        ExpressionAttributeNames: { '#st': 'status' },
        ExpressionAttributeValues: {
          ':bac': comparison,
          ':st': outcomeCategory === 'IMPROVED' ? 'Resolved' : invRes.Item?.status || 'Open',
          ':out': comparison.summary,
          ':u': new Date().toISOString()
        }
      }));

      return buildResponse(200, { success: true, comparison });
    }

    // PATCH /investigations/{investigationId}
    if (httpMethod === 'PATCH' && investigationId) {
      const body = event.body ? JSON.parse(event.body) : {};
      const updates = [];
      const values = {};
      const names = {};

      Object.entries(body).forEach(([key, val]) => {
        if (key !== 'id') {
          updates.push(`#${key} = :${key}`);
          names[`#${key}`] = key;
          values[`:${key}`] = val;
        }
      });
      updates.push('#updatedAt = :updatedAt');
      names['#updatedAt'] = 'updatedAt';
      values[':updatedAt'] = new Date().toISOString();

      await docClient.send(new UpdateCommand({
        TableName: TABLE_NAMES.INVESTIGATIONS,
        Key: { id: investigationId },
        UpdateExpression: `SET ${updates.join(', ')}`,
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values
      }));

      return buildResponse(200, { success: true, updatedId: investigationId });
    }

    // GET /investigations/{investigationId}
    if (httpMethod === 'GET' && investigationId) {
      const res = await docClient.send(new GetCommand({
        TableName: TABLE_NAMES.INVESTIGATIONS,
        Key: { id: investigationId }
      }));
      if (!res.Item) return errorResponse(404, `Investigation ${investigationId} not found.`);
      return buildResponse(200, res.Item);
    }

    // POST /investigations
    if (httpMethod === 'POST') {
      const body = event.body ? JSON.parse(event.body) : {};
      const invId = body.id || `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const item = {
        id: invId,
        zoneId: body.zoneId || '',
        readingDate: body.readingDate || new Date().toISOString().slice(0, 10),
        readingId: body.readingId || null,
        title: body.title || 'Water Discrepancy Investigation',
        unexplainedDifference: Number(body.unexplainedDifference || 0),
        discrepancyPercentage: Number(body.discrepancyPercentage || 0),
        priority: body.priority || 'Medium',
        priorityReason: body.priorityReason || 'Triggered by water balance threshold.',
        status: body.status || 'Open',
        assignedOperator: body.assignedOperator || 'Unassigned',
        evidenceNotes: body.evidenceNotes || '',
        inspections: [],
        createdAt: new Date().toISOString()
      };

      await docClient.send(new PutCommand({
        TableName: TABLE_NAMES.INVESTIGATIONS,
        Item: item
      }));

      return buildResponse(201, item);
    }

    // GET /investigations
    const scanRes = await docClient.send(new ScanCommand({
      TableName: TABLE_NAMES.INVESTIGATIONS
    }));
    const items = scanRes.Items || [];
    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return buildResponse(200, items);
  } catch (err) {
    console.error('Error in investigations handler:', err);
    return errorResponse(500, 'Internal server error processing investigations.', [err.message]);
  }
}
