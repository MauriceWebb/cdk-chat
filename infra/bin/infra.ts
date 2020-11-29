#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { InfraStack } from '../lib/infra-stack';

const appName = 'cdkChat'
const deployEnv = process.env.DEPLOY_ENV || 'dev'

const app = new cdk.App();
new InfraStack(app, `${appName}-${deployEnv}-infra`);
