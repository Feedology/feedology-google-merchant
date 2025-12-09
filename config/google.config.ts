// Environment variables are loaded directly from process.env

export interface GoogleConfig {
    clientId: string;
    clientSecret: string;
    scopes: string[];
    merchantApiVersion: string; 
}

export const googleConfig: GoogleConfig = {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    scopes: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/content',
        'openid',
        'email',
        'profile',
    ],
    merchantApiVersion: process.env.GOOGLE_MERCHANT_API_VERSION || 'v1beta',
};

export default googleConfig;
