import authService from './msalservice.js';

document.addEventListener('DOMContentLoaded', async () => {
    await authService.initialize(); // Ensure authService is initialized
    updateAuthLinks();

    document.getElementById('login-link').addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            await authService.login();
            updateAuthLinks();
        } catch (error) {
            console.error('Login error:', error);
        }
    });

    document.getElementById('logout-link').addEventListener('click', (e) => {
        e.preventDefault();
        authService.logout();
        updateAuthLinks();
    });
});

function updateAuthLinks() {
    const isLoggedIn = authService.isLoggedIn();
    const loginLink = document.getElementById('login-link');
    const logoutLink = document.getElementById('logout-link');
    const userNameSpan = document.getElementById('user-name');
    const tenantIdSpan = document.getElementById('tenant-id');
    if (isLoggedIn) {
        const userClaims = authService.getTokenClaims();
        const userName = userClaims ? `Hi, ${userClaims.name}` : '';
        userNameSpan.textContent = userName; // Set the user's name
        userNameSpan.style.display = 'inline-block'; // Make the user's name visible

        loginLink.style.display = 'none';
        logoutLink.style.display = 'block';
    } else {
        userNameSpan.style.display = 'none'; // Hide the user's name when logged out
        loginLink.style.display = 'block';
        logoutLink.style.display = 'none';
    }
}