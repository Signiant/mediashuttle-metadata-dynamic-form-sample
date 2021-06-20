const AWS = require('aws-sdk');
const ejs = require('ejs');
const fs = require('fs');

const generateFormHtml = async ({ templateValues }) => {
    const formHtmlTemplate = fs.readFileSync('../assets/form.html', 'utf8');

    console.log(`Generating form HTML using template values: ${JSON.stringify(templateValues)}`);
    const formHtml = ejs.render(formHtmlTemplate, templateValues);
    return formHtml;
};

module.exports = generateFormHtml;
