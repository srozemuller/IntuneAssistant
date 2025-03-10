import authService from './msalservice.js';
import { checkTenantOnboardingStatus } from '../components/onboarded-check';
import { toast } from 'sonner';

document.addEventListener('DOMContentLoaded', async () => {
    await authService.initialize(); // Ensure authService is initialized
    await checkOnboardingAndUpdateUI();

    document.getElementById('login-link').addEventListener('click', async (e) => {
        e.preventDefault();
        if (authService.isInteractionInProgress()) {
            console.log('Login interaction is already in progress.');
            return;
        }
        try {
            await authService.login();
            await checkOnboardingAndUpdateUI();
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

async function checkOnboardingAndUpdateUI() {
    updateAuthLinks();
    if (authService.isLoggedIn()) {
        try {
            const onboardingStatus = await checkTenantOnboardingStatus();
            if (!onboardingStatus.isOnboarded) {
                // Show onboarding notification
                showOnboardingNotification(onboardingStatus.tenantId, onboardingStatus.tenantName);
            }
        } catch (error) {
            console.error('Error checking onboarding status:', error);
        }
    }
}

function showOnboardingNotification(tenantId, tenantName) {
    toast({
        title: "Tenant Not Onboarded",
        description: `Your tenant ${tenantName || tenantId} needs to be onboarded before using this application.`,
        action: {
            label: "Onboard Now",
            onClick: () => window.location.href = `/onboarding?tenantId=${tenantId}`
        },
        duration: 0 // Don't auto-dismiss
    });
}

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