// @flow

import React, { Component } from 'react';
// For develop/testing purposes the package build is copying
// S3PostUploader to components
//import S3PostUploader, {
//Error as UploadError,
//S3Result,
//} from '../S3PostUploader';
import S3PostUploader, {
  Error as UploadError,
  S3Result,
} from 'react-s3-post-uploader';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import ImageIcon from '@material-ui/icons/Image';
import CircularProgress from '@material-ui/core/CircularProgress';

import './index.css';

type State = {
  isLoading: boolean,
  uploadPercentage: number,
  uploadError: ?UploadError,
  attachments: Array<S3Result>,
};

class Uploads extends Component<{}, State> {
  state = {
    isLoading: false,
    uploadPercentage: 0,
    uploadError: undefined,
    attachments: [],
  };

  uploadInput: HTMLInputElement;

  onClick = (event: SyntheticEvent<HTMLInputElement>) => {
    event.preventDefault();
    this.uploadInput.click();
  };

  openAttachment = (url: string) => {
    return (event: SyntheticEvent<>) => {
      event.preventDefault();
      const win = window.open(url, '_blank');
      win.focus();
    };
  };

  setInputRef = (input: HTMLInputElement) => {
    this.uploadInput = input;
  };

  setUploadState = (loading: boolean, error: UploadError) => {
    this.setState({ isLoading: loading, uploadError: error });
  };

  setUploadPercentage = (uploadPercentage: number) => {
    this.setState({ uploadPercentage: uploadPercentage });
  };

  addAttachment = (attachment: S3Result) => {
    this.setState(prevState => ({
      attachments: [...prevState.attachments, attachment],
    }));
  };

  onUploadStart = () => {
    this.setUploadState(true);
  };

  onUploadProgress = (progressEvent: ProgressEvent) => {
    const uploadPercentage = Math.round(
      (progressEvent.loaded / progressEvent.total) * 100
    );
    this.setUploadPercentage(uploadPercentage);
  };

  onUploadFinish = (uploadResult: S3Result, file: File) => {
    this.addAttachment(uploadResult);
    this.setUploadState(false);
    this.setUploadPercentage(0);
  };

  onUploadError = (error: UploadError) => {
    this.setUploadState(false, error);
  };

  getCredentials = (file: File, callback: Function) => {
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
      .then(({ url, fields }) => {
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
    const { attachments } = this.state;

    return (
      <List className="attachments">
        <h3>Attachments</h3>
        {attachments.map(attachment => (
          <ListItem
            key={attachment.etag}
            onClick={this.openAttachment(attachment.location)}
            button
          >
            <Avatar>
              <ImageIcon />
            </Avatar>
            <ListItemText
              primary={attachment.key}
              secondary={attachment.location}
            />
          </ListItem>
        ))}
      </List>
    );
  };

  renderError = () => {
    const { uploadError } = this.state;

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
    const { isLoading, uploadPercentage } = this.state;

    if (isLoading)
      return (
        <>
          <CircularProgress />
          <label className="percentage">{uploadPercentage}%</label>
        </>
      );

    return (
      <div>
        <Button onClick={this.onClick} variant="outlined" component="span">
          Upload Attachments
        </Button>
        {this.renderError()}
      </div>
    );
  };

  render() {
    return (
      <div className="uploads">
        {this.renderAttachments()}
        <S3PostUploader
          onStart={this.onUploadStart}
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
