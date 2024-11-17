// layout.js

import React from 'react';
import { Container } from '@mui/material'; // or any other UI library you are using

const Layout = ({ children }) => {
  return (
    <>
      <html>
        <head>
          <title>Your App Title</title>
          {/* Add meta tags, links to stylesheets, etc. */}
        </head>
        <body>
          <Container>
            {/* Add your header, navigation, and other layout components here */}
            <main>
              {children}
            </main>
            {/* Add your footer or other global components here */}
          </Container>
        </body>
      </html>
    </>
  );
};

export default Layout;