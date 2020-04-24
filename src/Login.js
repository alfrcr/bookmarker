import React from 'react';
import {
  TextField,
  Button,
  Typography,
  Divider,
  FormHelperText,
} from '@material-ui/core';
import { useForm } from 'react-hook-form';
import { Container, Form, InputBlock } from './helpers';

const Login = ({ authenticate, state }) => {
  const { register, handleSubmit, errors } = useForm();

  const onSubmit = (data) => {
    authenticate(data);
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
              name="username"
              label="Username"
              inputRef={register({ required: true })}
            />
            <FormHelperText error>
              {errors.username ? 'Username is required' : null}
            </FormHelperText>
          </InputBlock>

          <InputBlock>
            <TextField
              fullWidth
              name="password"
              label="Password"
              type="password"
              inputRef={register({ required: true })}
            />
            <FormHelperText error>
              {errors.password ? 'Password is required' : null}
            </FormHelperText>
          </InputBlock>
        </div>
        <Button
          fullWidth
          type="submit"
          variant="contained"
          color="primary"
          style={{ marginTop: 16 }}
          disabled={state.loading}
        >
          {state.loading ? 'Loading...' : 'Login'}
        </Button>
        <div style={{ marginTop: 8 }}>
          <Typography variant="body2" color="secondary">
            {state.error ? 'Error while trying to authenticate' : null}
          </Typography>
        </div>
      </Form>
    </Container>
  );
};

export default Login;
