import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { msalInstance } from '../../authconfig';

const LoginCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        msalInstance.handleRedirectPromise()
            .then((response) => {
                if (response) {
                    // Handle successful login
                    navigate('/status/onboarded');
                } else {
                    // Handle login failure
                    navigate('/status/error');
                }
            })
            .catch(() => {
                // Handle login failure
                navigate('/status/error');
            });
    }, [navigate]);

    return <div>Loading...</div>;
};

export default LoginCallback;