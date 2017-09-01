import axios from 'axios';
import {keys} from 'lodash';

const MAIN_URL = 'http://138.197.185.108:5002/';

let myInit = {
  method: 'POST',
};

function objectToFormData(obj) {
  let data = new window.FormData();
  keys(obj).forEach(key => {
    data.append(key, obj[key]);
  })
  return data;
}

export const post = (url, data, {isFormData} = {}) => {
  if (isFormData) {
    data = objectToFormData(data);
  }
  return axios({
    ...myInit,
    url: MAIN_URL + url,
    data: (data)
  });
}
