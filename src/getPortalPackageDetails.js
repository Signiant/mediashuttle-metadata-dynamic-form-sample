const generateSignedUrl = require('./generateSignedUrl');
const got = require('got');

const getPortalPackageDetails = async (portalPackageUrl) => {
    const signedPortalPackageUrl = generateSignedUrl({ requestUrl: portalPackageUrl });

    console.log(`Fetching Media Shuttle portal package details from ${signedPortalPackageUrl}`);
    const {
        body: { packageDetails = {} },
    } = await got(signedPortalPackageUrl, { responseType: 'json' });

    console.log(`Received following package details from Media Shuttle: ${JSON.stringify(packageDetails)}`);
    return packageDetails;
};

module.exports = getPortalPackageDetails;
