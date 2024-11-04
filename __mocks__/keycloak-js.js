// __mocks__/keycloak-js.js

// Mock implementation of the Keycloak class
const Keycloak = jest.fn(() => ({
  init: jest.fn().mockResolvedValue(true), // Mocks successful initialization
  login: jest.fn().mockResolvedValue(true), // Mocks successful login
  logout: jest.fn().mockResolvedValue(true), // Mocks successful logout
  authenticated: true, // Mocks that the user is authenticated
  accountManagement: jest.fn(), // Mocks account management
  token: 'mock-token', // Mocks a token
  updateToken: jest.fn().mockResolvedValue(true), // Mocks token refresh
  authServerUrl: 'http://mock-server-url', // Mocks the auth server URL
  realm: 'mock-realm', // Mocks the realm
}));

// Export the mock class
module.exports = Keycloak;
