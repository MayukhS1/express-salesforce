var express = require('express');
var router = express.Router();
const dotenv = require('dotenv');
const jsforce = require('jsforce');

dotenv.config();

const SF_CLIENT_ID = process.env.SF_CLIENT_ID;
const SF_CLIENT_SECRET = process.env.SF_CLIENT_SECRET;
const SF_USERNAME = process.env.SF_USERNAME;
const SF_PASSWORD = process.env.SF_PASSWORD;
const SF_SECURITY_TOKEN = process.env.SF_SECURITY_TOKEN;
const SF_LOGIN_URL = process.env.SF_LOGIN_URL;
const SF_INSTANCE_URL = process.env.SF_INSTANCE_URL;
const redirect_uri = process.env.REDIRECT_URI;
var accessToken = '';


var conn = new jsforce.Connection({
  oauth2 : {
    loginUrl: SF_LOGIN_URL,
    clientId : SF_CLIENT_ID,
    clientSecret : SF_CLIENT_SECRET,
    redirectUri : redirect_uri
  }
});

const loginToIntegrationUser = () => {
  return new Promise((resolve, reject) => {
    const completePassword = SF_PASSWORD+SF_SECURITY_TOKEN;
    conn.login(SF_USERNAME, completePassword, function(err, userInfo) {
      if (err) { 
        reject(err);
      }
      // Now you can get the access token and instance URL information.
      // Save them to establish connection next time.
      resolve(conn);
      console.log(conn.accessToken);
      console.log(conn.instanceUrl);
      // logged in user property
      console.log("User ID: " + userInfo.id);
      console.log("Org ID: " + userInfo.organizationId);
      // ...
    });
  });
}

const getTransactionData = () => {
  return new Promise((resolve, reject) => {
    conn.query("SELECT Id, Name FROM Account Limit 1", function(err, result) {
      if (err) {
        reject(err);
      }
      resolve(result);
    });
  });
}

router.get('/login', function(req, res, next) {
  try{
    loginToIntegrationUser()
    .then((data) => {
      accessToken = data.accessToken;
      getTransactionData()
      .then((data) => {
        console.log(data);
      })
      res.status(200).send('Login Successful! Backup on progress...');
    })
    .catch((err) => {
      res.status(500).send('Error Occurred');
    });
  }catch(err){
    console.log(err);
    res.status(500).send('Error Occurred');
  }
});

module.exports = router;
