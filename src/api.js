/* global chrome */
/* eslint-disable no-undef */

import axios from 'axios';
import { TOKEN_KEY, DEV_PAGE } from './constants';

const instance = axios.create({
  baseURL: 'https://prakerjagratis.com',
  timeout: 10000,
  headers: {
    Accept: 'application/json, text/plain, */*',
    'Content-Type': 'application/json; charset=utf-8',
  },
});

let token = '';

if (window.location.href.indexOf(DEV_PAGE) === -1) {
  chrome.storage.sync.get([TOKEN_KEY], (result) => {
    token = result[TOKEN_KEY];
  });
} else {
  token = window.localStorage.getItem(TOKEN_KEY);
}

instance.interceptors.request.use(
  async (config) => {
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export default instance;
