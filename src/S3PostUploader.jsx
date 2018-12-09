// @flow

import * as React from 'react';
import {PureComponent} from 'react';
import PropTypes from 'prop-types';
import jsonConvertor from 'xml-js';
import _ from 'lodash';

function convertToCleanJson(data: Object) {
  const json = _.reduce(
    _.keys(data),
    (acc, key) => {
      acc[key] = data[key].text;
      return acc;
    },
    {},
  );

  return json;
}

class S3PostUploader extends PureComponent<Props> {
  inputRef: ?HTMLInputElement;

  handleChange = (e: SyntheticEvent<HTMLInputElement>) => {
    if (!(e.target instanceof window.HTMLInputElement)) {
      return;
    }
    const {getCredentials} = this.props;

    getCredentials(e.target.files[0], this.uploadToS3);
  };

  assignRef = (input: HTMLInputElement | null) => {
    const {inputRef} = this.props;
    this.inputRef = input;
    if (inputRef && input) inputRef(input);
  };

  /* eslint-disable camelcase */
  uploadToS3 = (
    file: File,
    {upload_url, params}: {upload_url: string, params: S3Params},
  ): void => {
    const formData = new FormData();
    const {onProgress, onFinish, onError} = this.props;

    _.keys(params).forEach(key => formData.append(key, params[key]));

    if (onProgress) onProgress();
    formData.append('file', file);
    this.clear();

    fetch(upload_url, {
      method: 'POST',
      body: formData,
    })
      .then(response => response.text())
      .then(text => {
        const parsed = JSON.parse(
          jsonConvertor.xml2json(text, {
            compact: true,
            elementNameFn: val => val.toLowerCase(),
            textKey: 'text',
          }),
        );

        if (parsed.error) throw convertToCleanJson(parsed.error);

        return convertToCleanJson(parsed.postresponse);
      })
      .then(data => onFinish && onFinish(data, file))
      .catch(error => onError && onError(error));
  };
  /* eslint-enable camelcase */

  clear = (): void => {
    if (this.inputRef) this.inputRef.value = '';
  };

  render(): React.Node {
    const {accept} = this.props;

    return (
      <input
        type="file"
        ref={this.assignRef}
        accept={accept}
        onChange={this.handleChange}
      />
    );
  }
}

type S3Result = {
  bucket: string,
  etag: string,
  location: string,
};

type Error = {
  code: string,
  message: string,
};

type S3Params = {
  acl?: string,
  key: string,
  policy: string,
  success_action_status?: string,
  'content-type'?: string,
  'x-amz-algorithm': string,
  'x-amz-credential': string,
  'x-amz-date': string,
  'x-amz-signature': string,
};

type Props = {
  accept: string,
  onProgress: () => void,
  onFinish: (S3Result, File) => void,
  onError: Error => void,
  inputRef: HTMLInputElement => void,
  getCredentials: (
    File,
    (File, {upload_url: string, params: S3Params}) => void,
  ) => void,
};

export default S3PostUploader;
