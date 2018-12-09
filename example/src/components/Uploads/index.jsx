import React, {Component} from 'react';
import PropTypes from 'prop-types';
import S3PostUploader from '../S3PostUploader';

import './index.css';

class Uploads extends Component {
  state = {
    isLoading: false,
    uploadError: undefined,
    attachments: [],
  };

  onClick = event => {
    event.preventDefault();
    this.uploadInput.click();
  };

  setInputRef = input => {
    this.uploadInput = input;
  };

  setUploadState = (loading, error) => {
    this.setState({isLoading: loading, uploadError: error});
  };

  addAttachment = attachment => {
    this.setState(prevState => ({
      attachments: [...prevState.attachments, attachment],
    }));
  };

  onUploadProgress = () => {
    this.setUploadState(true);
  };

  onUploadFinish = (uploadResult, file) => {
    this.addAttachment(uploadResult);
    this.setUploadState(false);
  };

  onUploadError = error => {
    this.setUploadState(false, error);
  };

  getCredentials = (file, callback) => {
    const postData = {
      filename: file.name,
      mimeType: file.type,
      path: 'album/123',
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
      .catch(error => {
        this.onUploadError(error);
      });
  };

  renderAttachments = () => {
    const {attachments} = this.state;

    return (
      <div className="attachments">
        <h3>Attachments</h3>
        {attachments.map(attachment => (
          <a
            className="attachment"
            key={attachment.etag}
            target="_blank"
            rel="noopener noreferrer"
            href={attachment.location}>
            {attachment.key}
          </a>
        ))}
      </div>
    );
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
        {this.renderAttachments()}
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
