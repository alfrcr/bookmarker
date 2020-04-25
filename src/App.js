import React from 'react';
import { Typography, Divider } from '@material-ui/core';

import Login from './Login';
import Main from './Main';
import { Container } from './components';
import { useYoutubeChecker, useAuth } from './hooks';

const Warning = () => (
  <Container>
    <Typography variant="h6">Prakerja Bookmarker</Typography>
    <Divider style={{ marginBottom: 16 }} />
    <Typography variant="body1" color="textSecondary">
      Mohon buka sebuah video youtube terlebih dahulu
    </Typography>
  </Container>
);

const App = () => {
  const isYoutubePage = useYoutubeChecker();
  const [isAuthorized, { login, logout }, state] = useAuth();

  return (
    <React.Fragment>
      {isYoutubePage ? (
        isAuthorized ? (
          <Main logout={logout} />
        ) : (
          <Login authenticate={login} state={state} />
        )
      ) : (
        <Warning />
      )}
    </React.Fragment>
  );
};

export default App;
