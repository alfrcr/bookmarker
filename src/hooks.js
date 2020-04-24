/* global chrome */
/* eslint-disable no-undef */

import React from 'react';
import api from './api';
import {
  CHROME_ENV,
  DEV_PAGE,
  YOUTUBE_DETAIL_PAGE,
  TOKEN_KEY,
} from './constants';

export const useYoutubeChecker = () => {
  const whitelistedURL = [YOUTUBE_DETAIL_PAGE, DEV_PAGE];
  const [currentURL, setCurrentURL] = React.useState(DEV_PAGE);

  React.useEffect(() => {
    if (CHROME_ENV) {
      chrome.tabs.query(
        {
          active: true,
          lastFocusedWindow: true,
        },
        (tabs) => {
          setCurrentURL(tabs[0].url);
        },
      );
    }
  }, []);

  return whitelistedURL.some((url) => currentURL.includes(url));
};

export const useAuth = () => {
  const [isAuthorized, setAuth] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);

  // set default value
  React.useEffect(() => {
    if (CHROME_ENV) {
      chrome.storage.sync.get([TOKEN_KEY], (result) => {
        if (result[TOKEN_KEY]) {
          setAuth(true);
        }
      });
    } else {
      const token = window.localStorage.getItem(TOKEN_KEY);
      if (token) {
        setAuth(true);
      }
    }
  }, []);

  const callback = React.useCallback(({ username, password }) => {
    setLoading(true);
    api
      .post('/wp-json/jwt-auth/v1/token', {
        username,
        password,
      })
      .then(({ data: res }) => {
        if (res) {
          if (CHROME_ENV) {
            chrome.storage.sync.set(
              {
                [TOKEN_KEY]: res.token,
              },
              () => {
                console.info('Token has been saved!');
              },
            );
          } else {
            window.localStorage.setItem(TOKEN_KEY, res.token);
          }

          setAuth(true);
        } else {
          console.error(
            `Failed to authorizing using this credential. Get response: `,
            JSON.stringify(res),
          );
        }
      })
      .catch((err) => {
        console.error(`Fatal: `, err);
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return [isAuthorized, callback, { loading, error }];
};

export const useMetaCrawler = ({
  setCurrentURL,
  setCurrentTitle,
  setCurrentAuthor,
  setCurrentDesc,
}) => {
  React.useEffect(() => {
    if (CHROME_ENV) {
      chrome.tabs.query(
        {
          active: true,
          lastFocusedWindow: true,
        },
        (tabs) => {
          const { id: tabId } = tabs[0].url;
          let url = tabs[0].url;

          setCurrentURL(url);

          let code = `(function getAuthorAndDescription() {
            const title = document.querySelectorAll('h1.title > yt-formatted-string')
            const author = document.querySelectorAll('yt-formatted-string.ytd-channel-name > a');
            const content = document.querySelectorAll('yt-formatted-string.content');

            if (title.length === 0) {
              console.error('DOM not found. Failed to get title');
              return;
            }

            if (author.length === 0) {
              console.error('DOM not found. Failed to get author name');
              return;
            }

            if (content.length === 0) {
              console.error('DOM not found. Failed to get video description')
              return;
            }

            return {
              title: title[0].innerText,
              author: author[0].innerText,
              description: content[0].innerText
            }
          })()`;

          chrome.tabs.executeScript(
            tabId,
            {
              code,
            },
            function (result) {
              if (result.length > 0) {
                setCurrentTitle(result[0].title);
                setCurrentAuthor(result[0].author);
                setCurrentDesc(result[0].description);
              }
            },
          );
        },
      );
    }
  }, [setCurrentAuthor, setCurrentDesc, setCurrentTitle, setCurrentURL]);
};
