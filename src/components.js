import s, { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  body {
    margin: auto;
    width: 400px;
  }
`;

export const Container = s.div`
    padding: 16px;
`;

export const Form = s.form`
    display: flex;
    flex-flow: column wrap;
`;

export const InputBlock = s.div`
    width: 100%;
    display: block;
    margin-bottom: 16px;
`;

export const CloseButton = s.button`
  background: none;
  border: none;
  outline: none;
  textDecoration: underline;
`;
