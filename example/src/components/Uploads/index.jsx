import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import S3PostUploader from '../S3PostUploader';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import ImageIcon from '@material-ui/icons/Image';
import CircularProgress from '@material-ui/core/CircularProgress';

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

  openAttachment = url => {
    return event => {
      event.preventDefault();
      const win = window.open(url, '_blank');
      win.focus();
    };
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
      <List className="attachments">
        <h3>Attachments</h3>
        {attachments.map(attachment => (
          <ListItem
            key={attachment.etag}
            onClick={this.openAttachment(attachment.location)}
            button>
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

    if (isLoading) return <CircularProgress />;

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
      <div class="uploads">
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
