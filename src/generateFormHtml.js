const AWS = require('aws-sdk');
const ejs = require('ejs');
const s3 = new AWS.S3();

const generateFormHtml = async ({ s3Bucket, objectKey = 'form.html', templateValues }) => {
    console.log(`Fetching form HTML template from s3://${s3Bucket}/${objectKey}`);
    const { Body } = await s3.getObject({ Bucket: s3Bucket, Key: objectKey }).promise();
    const formHtmlTemplate = Body.toString('utf8');

    console.log(`Generating form HTML using template values: ${JSON.stringify(templateValues)}`);
    const formHtml = ejs.render(formHtmlTemplate, templateValues);
    return formHtml;
};

module.exports = generateFormHtml;
