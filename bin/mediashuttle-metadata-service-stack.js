const path = require('path');
const { Stack, CfnOutput } = require('@aws-cdk/core');
const { Function, Runtime, Code } = require('@aws-cdk/aws-lambda');
const { HttpApi } = require('@aws-cdk/aws-apigatewayv2');
const { LambdaProxyIntegration } = require('@aws-cdk/aws-apigatewayv2-integrations');
const { Bucket } = require('@aws-cdk/aws-s3');
const { BucketDeployment, Source } = require('@aws-cdk/aws-s3-deployment');

// Media Shuttle Submit Portal Registration key to secure requests between Media Shuttle and the external Metadata
// form service.
const REGISTRATION_KEY = '<REGISTRATION_KEY';

class MediaShuttleMetadataServiceStack extends Stack {
    constructor(scope, id, props) {
        super(scope, id, props);

        // Name of S3 bucket created in your AWS account where the lambda function retrieves the HTML metadata form
        // template from.
        const bucketName = `mediashuttle-metadata-${this.account}`;

        // Lambda function that responds to HTTP requests to fetch and process the metadata form.
        const metadataLambda = new Function(this, 'MediaShuttleMetadataHandler', {
            runtime: Runtime.NODEJS_14_X,
            code: Code.fromAsset(path.join(__dirname, '../deploy/lambda/function.zip')),
            handler: 'src/index.handler',
            environment: {
                REGISTRATION_KEY,
                S3_BUCKET_NAME: bucketName,
            },
        });

        // API Gateway HTTP endpoint that proxies metadata requests to the lambda function.
        const metadataHttpApi = new HttpApi(this, 'MediaShuttleMetadataEndpoint', {
            defaultIntegration: new LambdaProxyIntegration({
                handler: metadataLambda,
            }),
        });

        // S3 bucket for storing the metadata HTML form template that the lambda fetches/injects data into and returns.
        const metadataBucket = new Bucket(this, 'MediaShuttleMetadataBucket', {
            bucketName,
        });

        // Grant the lambda function read permissions on the S3 bucket.
        metadataBucket.grantRead(metadataLambda);

        // The metadata HTML form template.
        new BucketDeployment(this, 'MediaShuttleMetadataForm', {
            sources: [Source.asset(path.join(__dirname, '../assets'))],
            destinationBucket: metadataBucket,
        });

        // Cloud formation template outputs.
        new CfnOutput(this, 'Lambda Function', { value: metadataLambda.functionArn });
        new CfnOutput(this, 'S3 Bucket', { value: metadataBucket.bucketArn });
        new CfnOutput(this, 'Metadata HTTP API Base Url', { value: metadataHttpApi.url });
    }
}

module.exports = MediaShuttleMetadataServiceStack;
