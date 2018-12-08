//import Koa from 'koa';
const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const AWS = require('aws-sdk');

const awsConfig = {
  secrets: {
    accessKeyId: 'YOUR_ACCESS_KEY_ID',
    secretAccessKey: 'YOUR_SECRET_ACCESS_KEY',
    region: 'us-east-1',
  },
  bucket: 'bucket',
};

const app = new Koa();
const PORT = 3000;
const router = new Router();
const s3 = new AWS.S3();

AWS.config.update(awsConfig.secrets);

async function getCredentials(ctx) {
  params = {
    Bucket: awsConfig.bucket,
    Fields: {
      key: ctx.request.body.filename,
    },
    conditions: {
      acl: 'public-read',
    },
  };

  s3.createPresignedPost(params, function(err, data) {
    if (err) {
      console.error('Presigning post data encountered an error', err);
      ctx.body = err;
    } else {
      //data.Fields.key = 'path/to/uploads/${filename}';
      console.log('The post data is', data);
      ctx.body = data;
    }
  });
}

router.post('/get_credentials', getCredentials);

app.use(bodyParser());
app.use(router.routes());

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = server;
