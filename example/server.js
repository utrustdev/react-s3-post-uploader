//import Koa from 'koa';
const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const cors = require('koa2-cors');
const AWS = require('aws-sdk');

const awsConfig = {
  secrets: {
    accessKeyId: 'YOUR_ACCESS_KEY_ID',
    secretAccessKey: 'YOUR_SECRET_ACCESS_KEY',
    region: 'us-east-1',
  },
  bucket: 'bucket',
};
AWS.config.update(awsConfig.secrets);

const app = new Koa();
const PORT = 5000;
const router = new Router();
const s3 = new AWS.S3();

async function getCredentials(ctx) {
  const params = {
    Bucket: awsConfig.bucket,
    Fields: {
      key: [ctx.request.body.path, ctx.request.body.filename].join('/'),
      'Content-Type': ctx.request.body.mimeType,
      success_action_status: '201',
      acl: 'public-read',
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
      console.log('The post data is', data);
      ctx.body = data;
    }
  });
}

router.post('/get_credentials', getCredentials);

app.use(bodyParser());
app.use(cors());
app.use(router.routes());

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = server;
