import * as cdk from '@aws-cdk/core';
import * as cognito from '@aws-cdk/aws-cognito';

import { AmplifyCICDService } from '../services/cicd.service';
import { CognitoAuthService } from '../services/authentication.service';
import { AppsyncGraphQLAPIService } from '../services/graphqlapi.service';
import { DynamoDBDatabaseService } from '../services/database.service';

export class InfraStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // cicd pipeline:
    const pipeline = new AmplifyCICDService(this, `${id}Cicd`, {
      GitHubUsername: 'MauriceWebb',
      GitHubRepoName: 'cdk-chat',
      GitHubPATSM: {
        SecretName: 'global/gitHubPAT',
        SecretKey: 'gitHubPAT',
      },
      FrontendProjectDirectory: 'client',
      FrontendBaseDirectory: 'client/public',
      FrontendBuildCommand: 'build',
    });

    // auth userpoool & client:
    const auth = new CognitoAuthService(this, `${id}Auth`);

    // // database:
    const db = new DynamoDBDatabaseService(this, `${id}Database`, {
      tables: [{}],
    });

    // graphql api:
    const graphqlapi = new AppsyncGraphQLAPIService(this, `${id}GraphqlApi`, {
      SchemaAssetLocation: 'services/authentication.schema.graphql',
      UserPoolConfigUserPool: cognito.UserPool.fromUserPoolId(
        this,
        `${id}UserPoolRef`,
        `${id}UserPool`
      ),
      DirectLambdaResolverEnvironmentVariables: [
        {
          key: 'TABLE_NAME',
          value: id.split('Infra')[1],
        },
      ],
      Resolvers: [
        {
          typeName: 'Query',
          fieldName: 'listMessagesForRoom',
        },
        {
          typeName: 'Query',
          fieldName: 'listRooms',
        },
        {
          typeName: 'Mutation',
          fieldName: 'createMessage',
        },
        {
          typeName: 'Mutation',
          fieldName: 'createRoom',
        },
      ],
    });
  }
}
