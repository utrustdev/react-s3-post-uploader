// @flow

import * as React from 'react';
import jsonConvertor from 'xml-js';
import _ from 'lodash';
import axios from 'axios';

export type S3Result = {
  bucket: string,
  etag: string,
  location: string,
};

export type Error = {
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
  onStart: () => void,
  onProgress: ProgressEvent => void,
  onFinish: (S3Result, File) => void,
  onError: Error => void,
  inputRef: HTMLInputElement => void,
  getCredentials: (
    File,
    (File, { uploadUrl: string, params: S3Params }) => void
  ) => void,
};

function convertToCleanJson(data: Object) {
  const json = _.reduce(
    _.keys(data),
    (acc, key) => {
      acc[key] = data[key].text;
      return acc;
    },
    {}
  );

  return json;
}

class S3PostUploader extends React.PureComponent<Props> {
  inputRef: ?HTMLInputElement;

  handleChange = (e: SyntheticEvent<HTMLInputElement>) => {
    if (!(e.target instanceof window.HTMLInputElement)) {
      return;
    }
    const { getCredentials } = this.props;

    getCredentials(e.target.files[0], this.uploadToS3);
  };

  assignRef = (input: HTMLInputElement | null) => {
    const { inputRef } = this.props;
    this.inputRef = input;
    if (inputRef && input) inputRef(input);
  };

  /* eslint-disable camelcase */
  uploadToS3 = (
    file: File,
    { uploadUrl, params }: { uploadUrl: string, params: S3Params }
  ): void => {
    const formData = new FormData();
    const { onStart, onProgress, onFinish, onError } = this.props;

    _.keys(params).forEach(key => formData.append(key, params[key]));

    if (onStart) onStart();
    formData.append('file', file);
    this.clear();

    const config = onProgress ? { onUploadProgress: onProgress } : {};

    axios
      .post(uploadUrl, formData, config)
      .then(response => response.data)
      .then(text => {
        const parsed = JSON.parse(
          jsonConvertor.xml2json(text, {
            compact: true,
            elementNameFn: val => val.toLowerCase(),
            textKey: 'text',
          })
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
    const { accept } = this.props;

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

export default S3PostUploader;
