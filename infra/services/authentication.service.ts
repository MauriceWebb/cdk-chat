import * as cdk from '@aws-cdk/core';
import * as cognito from '@aws-cdk/aws-cognito';

export class CognitoAuthService extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props?: cdk.AppProps) {
    super(scope, id);

    const userPool = new cognito.UserPool(this, `UserPool`, {
      selfSignUpEnabled: true,
      accountRecovery: cognito.AccountRecovery.PHONE_AND_EMAIL,
      userVerification: {
        emailStyle: cognito.VerificationEmailStyle.CODE,
      },
      autoVerify: {
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
      },
    });

    const userPoolClient = new cognito.UserPoolClient(
      this,
      `UserPoolClient`,
      {
        userPool,
      }
    );

    const outputs = [
      { title: `UserPoolId`, value: userPool.userPoolId },
      {
        title: `UserPoolClientId`,
        value: userPoolClient.userPoolClientId,
      },
    ];

    outputs.forEach(({ title, value }) => {
      new cdk.CfnOutput(this, title, { value });
    });
  }

}
