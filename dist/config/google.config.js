// Environment variables are loaded directly from process.env
export const googleConfig = {
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
//# sourceMappingURL=google.config.js.map