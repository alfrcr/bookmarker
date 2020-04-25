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
import { flatten, groupChildren } from './helpers';

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

export const useMetaCrawler = (callback) => {
  React.useEffect(() => {
    if (CHROME_ENV) {
      chrome.tabs.query(
        {
          active: true,
          lastFocusedWindow: true,
        },
        (tabs) => {
          const { id: tabId } = tabs[0].url;
          let code = `(function getAuthorAndDescription() {
            const title = document.querySelectorAll('h1.title > yt-formatted-string')
            const author = document.querySelectorAll('yt-formatted-string.ytd-channel-name > a');
            const content = document.querySelectorAll('yt-formatted-string.content');
            const authorURL = document.querySelectorAll('#text-container a');

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
            
            if (authorURL.length === 0) {
              console.error('DOM not found. Failed to get author url')
              return;
            }
            

            return {
              title: title[0].innerText,
              author: author[0].innerText,
              description: content[0].innerText,
              authorURL: authorURL[0].href
            }
          })()`;

          chrome.tabs.executeScript(
            tabId,
            {
              code,
            },
            (result) => {
              if (result.length > 0) {
                callback(null, { ...result[0], url: tabs[0].url });
              } else {
                callback(Error('No result'), null);
              }
            },
          );
        },
      );
    }
  }, [callback]);
};

export const useCategories = () => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [categories, setCategories] = React.useState([]);

  React.useEffect(() => {
    api
      .get('/wp-json/wp/v2/course_category?per_page=100')
      .then(({ data: res }) => {
        const items = res.map((r) => {
          return {
            id: r.id,
            name: r.name,
            slug: r.slug,
            parent: r.parent,
            level: r.level,
          };
        });
        const grouped = groupChildren(items, 0);
        const flattened = flatten(grouped);

        setCategories(flattened);
      })
      .catch((err) => {
        console.error(err);
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return [categories, { loading, error }];
};

export const useTags = () => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [tags, setTags] = React.useState([]);

  React.useEffect(() => {
    api
      .get('/wp-json/wp/v2/course_tag')
      .then(({ data: res }) => {
        const tags = res.map((r) => ({
          id: r.id,
          name: r.name,
          slug: r.slug,
        }));
        setTags(tags);
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return [tags, { loading, error }];
};

export const useBookmark = () => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const promise = React.useCallback((data) => {
    setLoading(true);
    return new Promise((resolve, reject) => {
      api
        .post('/wp-json/wp/v2/course', {
          title: data.title,
          content: data.content,
          course_category: data.course_category,
          custom_tags: data.custom_tags,
          status: 'publish',
          custom_fields: {
            author_url: data.author_url,
            youtube_url: data.youtube_url,
            author_name: data.author_name,
          },
        })
        .then(() => {
          setSuccess(true);
          resolve();
        })
        .catch((err) => {
          console.error(err);
          setError(true);
          reject(err);
        })
        .finally(() => {
          setLoading(false);
        });
    });
  }, []);

  return [promise, { success, loading, error }];
};
