import React, {Component} from 'react';
import PropTypes from 'prop-types';
import S3PostUploader from '../S3PostUploader';

import './index.css';

class Uploads extends Component {
  state = {
    isLoading: false,
    uploadError: undefined,
  };

  onClick = event => {
    event.preventDefault();
    this.uploadInput.click();
  };

  setUploadState = (loading, error) => {
    this.setState({isLoading: loading, uploadError: error});
  };

  onUploadProgress = () => {
    this.setUploadState(true);
  };

  onUploadFinish = (uploadResult, file) => {
    this.setUploadState(false);
  };

  onUploadError = error => {
    this.setUploadState(false, error);
  };

  getCredentials = (file, callback) => {
    const postData = {
      filename: file.name,
      mimeType: file.type,
      path: '/album/123/',
    };

    fetch('http://localhost:5000/get_credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.api+json',
      },
      body: JSON.stringify(postData),
    })
      .then(response => {
        return response.json();
      })
      .then(params => {
        console.log(params);
        callback(file, {
          upload_url: params.url,
          params: {
            acl: params.acl,
            key: params.key,
            policy: params.Policy,
            'x-amz-signature': params['X-Amz-signature'],
            'x-amz-algorithm': params['X-Amz-Algorith'],
            'x-amz-date': params['X-Amz-Date'],
            'x-amz-credential': params['X-Aamz-Credential'],
            success_action_status: '201',
          },
        });
      })
      .catch(error => {
        this.onUploadError(error);
      });
  };

  renderError = () => {
    const {uploadError} = this.state;

    if (uploadError) {
      return (
        <div role="alert" className="errorMessage">
          {uploadError.code}
          {uploadError.message}
        </div>
      );
    }
  };

  setInputRef = input => {
    this.uploadInput = input;
  };

  renderButton = () => {
    const {isLoading} = this.state;

    if (isLoading) return <button type="button">Uploading ...</button>;

    return (
      <div>
        <button onClick={this.onClick} type="button">
          Upload Attachments
        </button>
        {this.renderError()}
      </div>
    );
  };

  render() {
    return (
      <div id="uploader">
        <S3PostUploader
          onProgress={this.onUploadProgress}
          onFinish={this.onUploadFinish}
          onError={this.onUploadError}
          getCredentials={this.getCredentials}
          inputRef={this.setInputRef}
        />
        {this.renderButton()}
      </div>
    );
  }
}

export default Uploads;
