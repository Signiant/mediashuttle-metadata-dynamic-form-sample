#!/usr/bin/env node

const cdk = require('@aws-cdk/core');
const MediaShuttleMetadataServiceStack = require('./mediashuttle-metadata-service-stack');

const app = new cdk.App();
new MediaShuttleMetadataServiceStack(app, 'MediaShuttle-Metadata-Collection-Stack');
