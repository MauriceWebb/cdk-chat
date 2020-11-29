import * as cdk from '@aws-cdk/core';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import { IGrantable } from '@aws-cdk/aws-iam';

interface DynamoDBDatabaseServiceProps extends cdk.StackProps {
  tables: {
    tableName?: string;
    attachedLambdaHandlers?: IGrantable[];
  }[];
}

export class DynamoDBDatabaseService extends cdk.Construct {
  constructor(
    scope: cdk.Construct,
    id: string,
    props?: DynamoDBDatabaseServiceProps
  ) {
    super(scope, id);

    const tables = props?.tables || [];

    tables.forEach(({ tableName = '', attachedLambdaHandlers = [] }, index) => {
      tableName =
        tableName ||
        `${id}${
          tables.length > 1
            ? (tableName || index) + '-'
            : tableName
            ? tableName + '-'
            : ''
        }`;

      const table = new dynamodb.Table(
        this,
        `${tableName}Table`,
        {
          tableName,
          billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
          partitionKey: {
            name: 'pk',
            type: dynamodb.AttributeType.STRING,
          },
          sortKey: {
            name: 'sk',
            type: dynamodb.AttributeType.STRING,
          },
        }
      );

      attachedLambdaHandlers.forEach((lambdaHandler) => {
        table.grantFullAccess(lambdaHandler);
      });
    });
  }
}
