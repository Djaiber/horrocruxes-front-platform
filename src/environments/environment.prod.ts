export const environment = {
  production: true,
  apiUrl: 'https://api.horrocruxes-harrypotter-rag.me', // or '/api' if using CloudFront routing

  cognito: {
    region: 'us-east-1',
    userPoolId: 'us-east-1_VmpTThD7q',
    clientId: '1htoo8ovmebc0mr97q50lcit86',
    domain: 'https://us-east-1vmptthd7q.auth.us-east-1.amazoncognito.com',

    redirectSignIn: 'https://horrocruxes-harrypotter-rag.me',
    redirectSignOut: 'https://horrocruxes-harrypotter-rag.me',
  },
} as const;
