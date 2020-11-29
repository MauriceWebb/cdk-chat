import * as cdk from '@aws-cdk/core';
import * as appsync from '@aws-cdk/aws-appsync';
import * as lambda from '@aws-cdk/aws-lambda';
import { IUserPool } from '@aws-cdk/aws-cognito';

interface AppsyncGraphQLAPIServiceProps extends cdk.StackProps {
  SchemaAssetLocation?: string;
  UserPoolConfigUserPool?: IUserPool;
  DirectLambdaResolverAssetDirectory?: string;
  DirectLambdaResolverAssetFilename?: string;
  DirectLambdaResolverEnvironmentVariables?: [{ key: string; value: string }];
  Resolvers?: {
    typeName: string;
    fieldName: string;
    mappingTemplates?: {
      request: string;
      response: string;
    };
  }[];
}

export class AppsyncGraphQLAPIService extends cdk.Construct {
  constructor(
    scope: cdk.Construct,
    id: string,
    props?: AppsyncGraphQLAPIServiceProps
  ) {
    super(scope, id);

    const api = new appsync.GraphqlApi(this, `Appsync`, {
      name: `${id}Appsync`,
      logConfig: {
        fieldLogLevel: appsync.FieldLogLevel.ALL,
      },
      schema: appsync.Schema.fromAsset(
        props?.SchemaAssetLocation || 'graphql/schema.graphql'
      ),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
        },
        additionalAuthorizationModes: props?.UserPoolConfigUserPool
          ? [
              {
                authorizationType: appsync.AuthorizationType.USER_POOL,
                userPoolConfig: {
                  userPool: props.UserPoolConfigUserPool,
                },
              },
            ]
          : undefined,
      },
    });

    new cdk.CfnOutput(this, `AppsyncUrl`, {
      value: api.graphqlUrl,
    });

    const directLambdaResolver = new lambda.Function(
      this,
      `DirectLambdaResolver`,
      {
        functionName: `${id}DirectLambdaResolver`,
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: props?.DirectLambdaResolverAssetFilename || 'main.handler',
        code: lambda.Code.fromAsset(
          props?.DirectLambdaResolverAssetDirectory || 'lambda-fns'
        ),
        memorySize: 1024,
      }
    );

    const environmentVariables =
      props?.DirectLambdaResolverEnvironmentVariables || [];

    environmentVariables.forEach(({ key, value }) => {
      directLambdaResolver.addEnvironment(key, value);
    });

    const directLambdaDataSource = api.addLambdaDataSource(
      `DirectLambdaDataSource`,
      directLambdaResolver
    );

    const resolvers = props?.Resolvers || [];

    resolvers.forEach(({ typeName, fieldName, mappingTemplates }) => {
      const resolver = {
        typeName,
        fieldName,
        requestMappingTemplate: mappingTemplates
          ? appsync.MappingTemplate.fromString(mappingTemplates?.request || '')
          : undefined,
        responseMappingTemplate: mappingTemplates
          ? appsync.MappingTemplate.fromString(mappingTemplates?.response || '')
          : undefined,
      };
      directLambdaDataSource.createResolver(resolver);
    });
  }
}
