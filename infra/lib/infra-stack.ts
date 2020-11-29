import * as cdk from '@aws-cdk/core';
import { AmplifyCICDService } from '../services/cicd.service';

export class InfraStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // cicd pipeline:
    const cicd = new AmplifyCICDService(this, id, {
      GitHubUsername: 'MauriceWebb',
      GitHubRepoName: 'cdk-chat',
      GitHubPATSM: {
        SecretName: 'global/gitHubPAT',
        SecretKey: 'gitHubPAT',
      },
      FrontendProjectDirectory: 'client',
      FrontendBaseDirectory: 'client/public',
      FrontendBuildCommand: 'build'
    });
  }
}
