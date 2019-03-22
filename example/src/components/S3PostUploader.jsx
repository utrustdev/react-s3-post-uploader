//      

import * as React from 'react';
import jsonConvertor from 'xml-js';
import _ from 'lodash';
import axios from 'axios';

                 
                 
               
                   
  

              
               
                  
  

                 
               
              
                 
                                 
                          
                            
                             
                       
                            
  

              
                 
                      
                                    
                                     
                         
                                     
                   
         
                                                            
            
  

function convertToCleanJson(data        ) {
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

class S3PostUploader extends React.PureComponent        {
                              

  handleChange = (e                                  ) => {
    if (!(e.target instanceof window.HTMLInputElement)) {
      return;
    }
    const { getCredentials } = this.props;

    getCredentials(e.target.files[0], this.uploadToS3);
  };

  assignRef = (input                         ) => {
    const { inputRef } = this.props;
    this.inputRef = input;
    if (inputRef && input) inputRef(input);
  };

  /* eslint-disable camelcase */
  uploadToS3 = (
    file      ,
    { upload_url, params }                                          
  )       => {
    const formData = new FormData();
    const { onStart, onProgress, onFinish, onError } = this.props;

    _.keys(params).forEach(key => formData.append(key, params[key]));

    if (onStart) onStart();
    formData.append('file', file);
    this.clear();

    const config = onProgress ? { onUploadProgress: onProgress } : {};

    axios
      .post(upload_url, formData, config)
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

  clear = ()       => {
    if (this.inputRef) this.inputRef.value = '';
  };

  render()             {
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
