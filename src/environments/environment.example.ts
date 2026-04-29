export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000',
  cognito: {
    region: 'us-east-1',
    userPoolId: 'YOUR_USER_POOL_ID',
    clientId: 'YOUR_CLIENT_ID',
  },
} as const;
