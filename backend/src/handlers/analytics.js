import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAMES } from '../lib/dynamoClient.js';
import { buildResponse, errorResponse } from '../lib/response.js';

export async function handler(event) {
  try {
    const queryParams = event.queryStringParameters || {};
    const zoneId = queryParams.zoneId || 'ALL';

    const [readingsRes, invsRes] = await Promise.all([
      docClient.send(new ScanCommand({ TableName: TABLE_NAMES.READINGS })),
      docClient.send(new ScanCommand({ TableName: TABLE_NAMES.INVESTIGATIONS }))
    ]);

    let readings = readingsRes.Items || [];
    let invs = invsRes.Items || [];

    if (zoneId !== 'ALL') {
      readings = readings.filter((r) => r.zoneId === zoneId);
      invs = invs.filter((i) => i.zoneId === zoneId);
    }

    const totalSupplied = readings.reduce((sum, r) => sum + (r.waterSupplied || 0), 0);
    const totalConsumed = readings.reduce((sum, r) => sum + (r.recordedConsumption || 0), 0);
    const totalStorage = readings.reduce((sum, r) => sum + (r.storageChange || 0), 0);
    const totalOutflows = readings.reduce((sum, r) => sum + (r.otherDocumentedOutflows || 0), 0);
    const totalDiscrepancy = readings.reduce((sum, r) => sum + (r.unexplainedDifference || 0), 0);

    const validReadings = readings.filter((r) => r.unexplainedDifference !== null);
    const avgDiscrepancyPercent = validReadings.length > 0
      ? Number((validReadings.reduce((sum, r) => sum + (r.discrepancyPercentage || 0), 0) / validReadings.length).toFixed(1))
      : 0;

    const activeInvestigations = invs.filter((i) => ['Open', 'Under Review', 'Inspection Required'].includes(i.status)).length;
    const highPriorityInspections = invs.filter((i) => ['Critical', 'High'].includes(i.priority) && i.status !== 'Resolved').length;

    return buildResponse(200, {
      totalSupplied,
      totalConsumed,
      totalStorageChange: totalStorage,
      totalOutflows,
      totalDiscrepancy,
      avgDiscrepancyPercent,
      activeInvestigations,
      highPriorityInspections,
      readingsCount: readings.length
    });
  } catch (err) {
    console.error('Error in analytics handler:', err);
    return errorResponse(500, 'Internal server error computing analytics.', [err.message]);
  }
}
