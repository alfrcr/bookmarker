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
  FormHelperText,
} from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { useForm } from 'react-hook-form';

import { Container, Form, InputBlock, CloseButton } from './components';
import { useMetaCrawler, useCategories, useTags, useBookmark } from './hooks';
import { DEV_PAGE } from './constants';

const Main = () => {
  const [currentURL, setCurrentURL] = React.useState(DEV_PAGE);
  const [currentTitle, setCurrentTitle] = React.useState(document.title);
  const [currentAuthor, setCurrentAuthor] = React.useState('');
  const [currentAuthorURL, setCurrentAuthorURL] = React.useState('');
  const [currentContent, setCurrentContent] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState(null);
  const [selectedTags, setSelectedTags] = React.useState([]);
  const [
    categories,
    { loading: categoriesLoading, error: categoriesError },
  ] = useCategories();
  const [tags, { loading: tagsLoading, error: tagsError }] = useTags();
  const { register, handleSubmit, setValue, errors } = useForm();
  const [
    bookmark,
    { success: bookmarkSuccess, loading: bookmarkLoading },
  ] = useBookmark();

  useMetaCrawler((err, meta) => {
    if (err) {
      console.error('Failed to get video meta');
      return;
    }

    setCurrentURL(meta.url);
    setCurrentTitle(meta.title);
    setCurrentAuthor(meta.author);
    setCurrentContent(meta.description);
    setCurrentAuthorURL(meta.authorURL);
  });

  const tagNames = tags.map((t) => t.name);
  const onSubmit = (data) => {
    bookmark(data).then(() => {
      setSelectedCategory(null);
      setSelectedTags([]);
    });
  };

  React.useEffect(() => {
    register({ name: 'course_category' }, { required: true });
    register({ name: 'custom_tags' }, { required: true });
  }, [register]);

  return (
    <Container>
      <Typography variant="h6">Prakerja Bookmarker</Typography>
      <Divider style={{ marginBottom: 16 }} />

      <Form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ flex: 1 }}>
          <InputBlock>
            <TextField
              fullWidth
              name="youtube_url"
              label="Youtube URL"
              value={currentURL}
              inputRef={register({ required: true })}
              disabled
            />
          </InputBlock>

          <InputBlock>
            <TextField
              fullWidth
              name="author_name"
              label="Author"
              value={currentAuthor}
              inputRef={register({ required: true })}
              disabled
            />
          </InputBlock>

          <InputBlock>
            <TextField
              fullWidth
              name="author_url"
              label="Channel URL"
              value={currentAuthorURL}
              inputRef={register({ required: true })}
              disabled
            />
          </InputBlock>

          <InputBlock>
            <TextField
              fullWidth
              name="title"
              label="Title"
              value={currentTitle}
              inputRef={register({ required: true })}
              disabled
            />
          </InputBlock>

          <textarea
            fullWidth
            name="content"
            label="Content"
            style={{ display: 'none' }}
            value={currentContent}
            ref={register({ required: true })}
          />

          <InputBlock>
            <FormControl fullWidth>
              <InputLabel>
                {categoriesLoading ? 'Loading categories...' : 'Category'}
              </InputLabel>
              <Select
                name="course_category"
                disabled={categoriesLoading}
                value={selectedCategory}
                onChange={({ target }) => {
                  setValue('course_category', [target.value]);
                  setSelectedCategory(target.value);
                }}
              >
                {categories.map((c) => {
                  return (
                    <MenuItem key={c.id} value={c.id}>
                      <span
                        dangerouslySetInnerHTML={{
                          __html: ''.padStart(c.level, '—') + ` ${c.name}`,
                        }}
                      />
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </InputBlock>
          <FormHelperText error>
            {categoriesError ? 'Failed to fetch categories' : null}
            {errors.course_category ? 'Category is required' : null}
          </FormHelperText>

          <InputBlock>
            <Autocomplete
              multiple
              freeSolo
              options={tagNames}
              disabled={tagsLoading}
              value={selectedTags}
              onChange={(_, value) => {
                setValue('custom_tags', value);
                setSelectedTags(value);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="standard"
                  label={categoriesLoading ? 'Loading tags...' : 'Tags'}
                  placeholder="Pilih tag"
                />
              )}
            />
          </InputBlock>
          <FormHelperText error>
            {tagsError ? 'Failed to fetch tags' : null}
            {errors.custom_tags ? 'Tags is required' : null}
          </FormHelperText>
        </div>
        <Button
          fullWidth
          type="submit"
          variant="contained"
          color="primary"
          style={{ marginTop: 16 }}
          disabled={bookmarkLoading || bookmarkSuccess}
        >
          {bookmarkLoading
            ? 'Loading...'
            : bookmarkSuccess
            ? 'Bookmarked'
            : 'Bookmark'}
        </Button>
      </Form>

      {bookmarkSuccess ? (
        <Typography variant="body1" style={{ marginTop: 8, color: 'green' }}>
          Successfully bookmarked.{' '}
          <CloseButton onClick={() => window.close()}>Close window</CloseButton>
        </Typography>
      ) : null}
    </Container>
  );
};

export default Main;
