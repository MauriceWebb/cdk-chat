import * as cdk from '@aws-cdk/core';
import * as amplify from '@aws-cdk/aws-amplify';
import * as codebuild from '@aws-cdk/aws-codebuild';

interface AmplifyCICDServiceProps extends cdk.StackProps {
  GitHubUsername: string;
  GitHubRepoName: string;
  GitHubPATSM: {
    SecretName: string;
    SecretKey?: string;
  };
  FrontendBaseDirectory?: string;
}

export class AmplifyCICDService extends cdk.Construct {
  constructor(
    scope: cdk.Construct,
    id: string,
    props?: AmplifyCICDServiceProps
  ) {
    super(scope, id);

    const amplifyCICD = new amplify.App(this, `${id}-AmplifyCICD`, {
      sourceCodeProvider: new amplify.GitHubSourceCodeProvider({
        owner: props?.GitHubUsername || '',
        repository: props?.GitHubRepoName || '',
        oauthToken: props?.GitHubPATSM?.SecretKey
          ? cdk.SecretValue.secretsManager(props.GitHubPATSM.SecretName, {
              jsonField: props.GitHubPATSM.SecretKey,
            })
          : cdk.SecretValue.secretsManager(props?.GitHubPATSM.SecretName || ''),
      }),
      buildSpec: codebuild.BuildSpec.fromObject({
        version: 1,
        frontend: {
          phases: {
            preBuild: { commands: ['npm ci'] },
            build: { commands: ['npm run build'] },
          },
          artifacts: {
            baseDirectory: props?.FrontendBaseDirectory || 'public',
            files: ['**/*'],
          },
          cache: {
            paths: ['node_modules/**/*'],
          },
        },
      }),
    });

    // add branches to cicd:
    const master = amplifyCICD.addBranch('master');
    const dev = amplifyCICD.addBranch('dev');
    dev.addEnvironment('STAGE', 'dev');
  }
}
