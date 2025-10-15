export class UserConsentRequiredError extends Error {
    consentUrl: string;

    constructor(url: string, message: string = 'Additional permissions required') {
        super(message);
        this.name = 'UserConsentRequiredError';
        this.consentUrl = url;
    }
}