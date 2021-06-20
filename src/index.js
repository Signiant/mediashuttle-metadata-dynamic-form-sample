const querystring = require('qs');
const getPortalPackageDetails = require('./getPortalPackageDetails');
const generateSignedUrl = require('./generateSignedUrl');
const generateFormHtml = require('./generateFormHtml');
const generateFormHtmlFromLocalAsset = require('./generateFormHtmlFromLocalAsset');
const byteSize = require('byte-size');
const fetch = require('node-fetch');
const { compact, uniq, uniqBy, orderBy } = require('lodash');
const { DateTime } = require('luxon');

const { S3_BUCKET_NAME: s3Bucket } = process.env;

const FORM_PATH = '/form';
const PROCESS_FORM_PATH = '/processForm';

const apikey = "<API_KEY>";

const fetchShows = async (info) => {
      const startDate = DateTime.now().toFormat('yyyy-MM-dd');
      const response = await fetch(`http://data.tmsapi.com/v1.1/programs/newShowAirings?lineupId=USA-TX42500-X&startDateTime=${startDate}&includeAdult=false&imageSize=Lg&imageText=true&api_key=${apikey}`, {

        method: 'GET',
        body: JSON.stringify(info),
        headers: {
            'Content-Type': ' application/json',
            Accept: ' application/json',
            credentials: ' same-origin',
        },
    });

    const rawdata = await response.json();

    let results = [];
    for (idx in rawdata) {
      // Let's filter results for programs released in 2021
      if (rawdata[idx].program && rawdata[idx].program.releaseYear == "2021") {
      let parsedData = {
        tmsId: rawdata[idx].program.tmsId,
        title : rawdata[idx].program.title,
        episodeTitle : rawdata[idx].program.episodeTitle,
        longDescription : rawdata[idx].program.longDescription,
        startTime : rawdata[idx].startTime,
        channels : rawdata[idx].channels,
        duration : rawdata[idx].duration,
    };

      if (parsedData.title) {
          results.push(parsedData);
          }
        }
}
// sort by series titles and list unique results
const sortedresults = orderBy(results, 'title', 'asc' );
const uniqueresults = uniqBy(sortedresults, "tmsId");
return uniqueresults;
};



const handleRequest = async (requestBody) => {
    // Extract the redirect URL passed by Media Shuttle in the request body. This is saved in the form as a hidden
    // form variable and used during form processing to return a response back to Media Shuttle.
    const { redirectUrl } = querystring.parse(requestBody);

    // Extract the Media Shuttle package endpoint url from the redirect URL. This endpoint can be invoked with a GET
    // request to retrieve package details prior displaying the metadata form for dynamic form generation. The package
    // endpoint url is the same as the redirectUrl without the /metadata suffix.
    const portalPackageUrl = redirectUrl.replace(/\/metadata$/, '');

    // Fetch package details from Media Shuttle and use them to fill in template values in the web form.
    const { sender, files, fileSize } = await getPortalPackageDetails(portalPackageUrl);
    const packageSize = byteSize(fileSize);

    const uniqueresults = await fetchShows();

    const templateValues = {
        redirectUrl,
        sender,
        files,
        formattedPackageSize: `${packageSize.value} ${packageSize.unit}`,
        uniqueresults,
    };

    // Generate the final metadata form HTML using the template values above.
    const formHtml = await generateFormHtml({ s3Bucket, templateValues });

    // Return the metadata form for Media Shuttle to display.
    return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/html' },
        body: formHtml,
    };
};


const handleProcessFormRequest = (requestBody) => {
    // Any custom processing to be performed on the metadata form submitted would be done here. This sample simply
    // handles the minimal handshaking requirement with Media Shuttle by redirecting the form submission back to Media
    // Shuttle so that the metadata can be persisted to the Media Shuttle package repository and the Submit portal
    // upload can be completed.

    // Extract the redirect URL saved as a hidden form parameter when the metadata form was submitted.
    const { redirectUrl } = querystring.parse(requestBody);

    // Sign the redirect URL so that Media Shuttle can verify the authenticity of the redirect request.
    const signedUrl = generateSignedUrl({
        requestUrl: redirectUrl,
        requestBody,
    });

    return {
        statusCode: 307,
        headers: { Location: signedUrl },
    };
};

exports.handler = async (event) => {
    const { rawPath: path, body, isBase64Encoded } = event;
    const requestBody = isBase64Encoded ? Buffer.from(body, 'base64').toString('utf8') : body;

    if (path === FORM_PATH) {
        console.log(`Received request for metadata form with request data: ${JSON.stringify(requestBody)}`);
        return handleRequest(requestBody);
    }

    if (path === PROCESS_FORM_PATH) {
        console.log(`Received request to process metadata form with form data: ${JSON.stringify(requestBody)}`);
        return handleProcessFormRequest(requestBody);
    }

    return { status: 404 };
};
