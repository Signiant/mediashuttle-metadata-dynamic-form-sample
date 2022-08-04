# Media Shuttle Metadata Example Using AWS

A sample project demonstrating the basics of setting up a metadata collection form for a Media Shuttle Submit portal
using Amazon Web Services (AWS) and Gracenote API to retrieve TV programming.

## Architecture

![architecture](architecture.png)

The sample uses a simple web service pattern where an API Gateway registering an HTTP API endpoint proxies
incoming requests to a backing Lambda function for processing. The Lambda function also makes use of a static
HTML template file stored in an S3 bucket to present to the user a selection of TV programming to describe 
the file they are about to upload. A Gracenote API key will be required to retrive the programming, and the
user can also specify segment length. 

## Getting Started

This sample project includes a fully deployable sample web service that can be deployed to your AWS account
using the AWS CDK after configuring the project with your Submit portal registration key.

Replace the placeholder value of the `REGISTRATION_KEY` variable in `bin/mediashuttle-metadata-service-stack.js`with
the registration key generated for your Submit portal. The registration key can be generated and retrieved from the
Metadata configuration page in the Media Shuttle portal admin console.

After configuring the registration key, the sample service can be built and deployed by running the following two
commands:

`npm run build` - prepares the project for deployment

`npm run deploy` - deploys CDK stack to your default AWS account/region

Finally, after being deployed to AWS, your Media Shuttle Submit portal metadata configuration needs to be updated to
reflect the Metadata form URL Media Shuttle should use to access your form.

Update the `Metadata provider URL` setting
under `Metadata` in the Media Shuttle portal admin console to the value of
`MediaShuttleMetadataServiceStack.MetadataHTTPAPIBaseUrl` in the `Outputs` section displayed to the console as a result
running the deploy command above with the path `/form` appended.

For example, if the value of `MediaShuttleMetadataServiceStack.MetadataHTTPAPIBaseUrl` is
`https://ax23u65ss5.execute-api.us-east-1.amazonaws.com/`, the value of `Metadata provider URL` should be
`https://ax23u65ss5.execute-api.us-east-1.amazonaws.com/form`.

This example can be deployed more than once. A unique bucket name defined in `bin/mediashuttle-metadata-service-stack.js`
is required, as well as a unique CDK stack name defined in `bin/mediashuttle-metadata-service.js` at line 7.

An outbound API call to Gracenote, located in `src/index.js` line 18 to 56 , is provided as an example and is optional.
Should you want to use it, the Gracenote API key needs to be inserted at line 16.
For more information on Gracenote’s OnConnect APIs and to register, please visit: https://developer.tmsapi.com/Getting_Started

Note: this sample was created using 
node v14.20.0
npm 6.14.17
cdk 1.92.0
