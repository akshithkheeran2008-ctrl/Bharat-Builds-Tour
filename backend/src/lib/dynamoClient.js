/**
 * AquaGen AWS DynamoDB Document Client
 *
 * Uses the AWS SDK v3 DynamoDB DocumentClient bundled in Node.js 18.x / 20.x Lambda runtimes.
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1'
});

export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertClassInstanceToMap: true
  }
});

export const TABLE_NAMES = {
  ZONES: process.env.ZONES_TABLE || 'AquaGenZones',
  READINGS: process.env.READINGS_TABLE || 'AquaGenReadings',
  INVESTIGATIONS: process.env.INVESTIGATIONS_TABLE || 'AquaGenInvestigations'
};
