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

import { Container, Form, InputBlock } from './helpers';
import { useMetaCrawler } from './hooks';
import { DEV_PAGE } from './constants';

function Main() {
  const [currentURL, setCurrentURL] = React.useState(DEV_PAGE);
  const [currentTitle, setCurrentTitle] = React.useState(document.title);
  const [currentAuthor, setCurrentAuthor] = React.useState('');
  const [currentDesc, setCurrentDesc] = React.useState('');

  const { register, handleSubmit, control, errors } = useForm();

  useMetaCrawler({
    setCurrentURL,
    setCurrentTitle,
    setCurrentAuthor,
    setCurrentDesc,
  });

  const onSubmit = (data) => {
    alert(JSON.stringify(data, null, 2));
    return false;
  };

  return (
    <Container>
      <Typography variant="h6">Prakerja Bookmarker</Typography>
      <Divider style={{ marginBottom: 16 }} />

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
    </Container>
  );
}

export default Main;
