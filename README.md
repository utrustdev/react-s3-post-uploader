# react-s3-post-uploader
[![](https://img.shields.io/github/license/utrustdev/react-s3-post-uploader.svg)](https://github.com/utrustdev/react-s3-post-uploader)

React component for S3 uploads via POST (only) ([sigv4-post-example](https://docs.aws.amazon.com/AmazonS3/latest/API/sigv4-post-example.html)).

## Install
`$ npm install --save @utrustdev/react-s3-post-uploader`

## Code Example (simplified)
Working full example (eg. with rendering errors) is [here](example/src/components/Uploads/index.jsx)

```jsx
import S3PostUploader from '@utrustdev/react-s3-post-uploader';


class Uploads extends Component {
  setInputRef = input => {
    this.uploadInput = input;
  };

  onClick = event => {
    event.preventDefault();
    this.uploadInput.click();
  };

  onUploadStart = () => {...}
  onUploadProgress = (progressEvent) => {...}
  onUploadFinish = (uploadResult, file) => {...}
  onUploadError = error => {...}

  getCredentials = (file, callback) => {
    fetch('url-returning-credentials-for-post-upload')
      .then(response => {
        return response.json();
      })
      .then(({url, fields}) => {
        callback(file, {
          upload_url: url,
          params: {
            acl: fields.acl,
            key: fields.key,
            policy: fields.Policy,
            success_action_status: fields.success_action_status,
            'content-type': fields['Content-Type'],
            'x-amz-signature': fields['X-Amz-Signature'],
            'x-amz-algorithm': fields['X-Amz-Algorithm'],
            'x-amz-date': fields['X-Amz-Date'],
            'x-amz-credential': fields['X-Amz-Credential'],
          },
        });
      })
  }

  render() {
    <S3PostUploader
      onStart={this.onUploadStart}
      onProgress={this.onUploadProgress}
      onFinish={this.onUploadFinish}
      onError={this.onUploadError}
      getCredentials={this.getCredentials}
      inputRef={this.setInputRef}
    />
    <div>
      <Button onClick={this.onClick} variant="outlined" component="span">
        Upload Attachments
      </Button>
    </div>
    }
}
```
#### S3PostUploader Props
- `onStart` - method called when uploading is started. Can be used to set some uploading state.
- `onProgress` - allows handling of progress events for uploads. The eventProgress struct is passing to function `{loaded: number, total: number, lengthComputable: boolean, ...}`. See usability for displaying uploaded percentage [here](example/src/components/Uploads/index.jsx)
- `onFinish` - function getting `(s3Result, file)` where `s3Result` is result from S3 and file is chosen file.
You can find relevant types [here](src/S3PostUploader.jsx) (type S3Result ...)
- `onError` - function getting `(error)`. Error returning from S3 if something went wrong with upload. Relevant type in [here](src/S3PostUploader.jsx) (type Error ...)
- `getCredentials` - function getting `(file, callback)`. File is chosen file. The `callback` is function
responsible for uploading file on S3 via POST with required credentials we were fetched from server.
- `inputRef` - function getting reference to original file field. Used for save reference in component and
call actions later on it (as shown in simple example above).

## Working Example
In [example](example) folder you can find working example with server. In readme of [example](example) are instructions
for running.

![Output sample](example/public/s3-post-uploader-screencast.gif)

## TODO

- [x] make [Upload](example/src/components/Uploads/index.jsx) example component with flow as [S3PostUploader](src/S3PostUploader.jsx) is
- [ ] add linter tests on CI with indicator in README
- [ ] make better copy for `Contribution` section

## Contribution
Please create an issue or open a pull request. Once you change something in `src/S3PostUploader.jsx` please don't
forget to run `yarn build` which will compile and also update S3PostUploader componnent in [example](example). After
this make sure [example](example) app is still working.

## Alternatives
- https://github.com/odysseyscience/react-s3-uploader support only `PUT` upload with pressigned URL ([PresignedUrlUploadObject](https://docs.aws.amazon.com/AmazonS3/latest/dev/PresignedUrlUploadObject.html))
