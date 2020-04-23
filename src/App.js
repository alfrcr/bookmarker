/* global chrome */
/* eslint-disable no-undef */

import React from 'react';
import {
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Divider,
} from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { useForm, Controller } from 'react-hook-form';

import { GlobalStyle, Container, Form, InputBlock } from './helpers';

const DEV_PAGE = 'localhost:3000';
const YOUTUBE_DETAIL_PAGE = 'youtube.com/watch?';

function App() {
  const [currentURL, setCurrentURL] = React.useState(DEV_PAGE);
  const [currentTitle, setCurrentTitle] = React.useState(document.title);
  const [currentAuthor, setCurrentAuthor] = React.useState('');
  const [currentDesc, setCurrentDesc] = React.useState('');

  const { register, handleSubmit, control, errors } = useForm();

  React.useEffect(() => {
    if (window.location.href.indexOf(DEV_PAGE) === -1) {
      chrome.tabs.query(
        {
          active: true,
          lastFocusedWindow: true,
        },
        (tabs) => {
          console.log(tabs);
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
  }, []);

  const onSubmit = (data) => {
    alert(JSON.stringify(data, null, 2));
    return false;
  };

  const blacklisted =
    [YOUTUBE_DETAIL_PAGE, DEV_PAGE].filter((url) => currentURL.includes(url))
      .length === 0;

  return (
    <Container>
      <GlobalStyle />
      <Typography variant="h6">Prakerja Bookmarker</Typography>
      <Divider style={{ marginBottom: 16 }} />
      {blacklisted ? (
        <Typography variant="body1" color="textSecondary">
          Mohon buka sebuah video youtube terlebih dahulu
        </Typography>
      ) : (
        <Form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ flex: 1 }}>
            <InputBlock>
              <TextField
                fullWidth
                name="url"
                label="URL"
                value={currentURL}
                inputRef={register}
                disabled
              />
            </InputBlock>

            <InputBlock>
              <TextField
                fullWidth
                name="author"
                label="Author"
                value={currentAuthor}
                inputRef={register}
                disabled
              />
            </InputBlock>

            <InputBlock>
              <TextField
                fullWidth
                name="title"
                label="Judul"
                value={currentTitle}
                inputRef={register}
                disabled
              />
            </InputBlock>

            <InputBlock>
              <TextField
                fullWidth
                name="description"
                label="Description"
                value={currentDesc}
                inputRef={register}
                disabled
              />
            </InputBlock>

            <Controller
              as={
                <InputBlock>
                  <FormControl fullWidth>
                    <InputLabel>Kategori</InputLabel>
                    <Select>
                      <MenuItem value={40}>Makanan</MenuItem>
                      <MenuItem value={10}>Ojek Online</MenuItem>
                      <MenuItem value={20}>Kerajinan Rumah Tangga</MenuItem>
                      <MenuItem value={30}>Pertanian/Perkebunan</MenuItem>
                    </Select>
                  </FormControl>
                </InputBlock>
              }
              name="category"
              control={control}
              defaultValue={10}
            />

            <Controller
              as={
                <InputBlock>
                  <Autocomplete
                    multiple
                    options={[{ title: 'keripik singkong' }, { title: 'baju' }]}
                    getOptionLabel={(option) => option.title}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="standard"
                        label="Tags"
                        placeholder="Pilih tag"
                      />
                    )}
                  />
                </InputBlock>
              }
              name="tags"
              control={control}
              defaultValue={[{ title: 'keripik singkong' }]}
            />
          </div>
          <Button
            fullWidth
            type="submit"
            variant="contained"
            color="primary"
            style={{ marginTop: 16 }}
          >
            Bookmark
          </Button>
        </Form>
      )}
    </Container>
  );
}

export default App;
