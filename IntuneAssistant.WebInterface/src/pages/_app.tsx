import React from 'react';
import { UserProvider } from '../contexts/usercontext.tsx';

const App = ({ Component, pageProps }) => {
    return (
        <UserProvider>
            <Component {...pageProps} />
        </UserProvider>
    );
};

export default App;