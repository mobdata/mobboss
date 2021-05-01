# Craftmaster Client

This is the client-side application for the Craftmaster application. It is built with React and Redux using the [create-react-app](https://github.com/facebookincubator/create-react-app) boilerplate code.

### Configuration

All of the build scripts and webpack configuration is handled by create-react-app. Simply reference the create-react-app's usage guide for commands like run and build.

### Development

Craftmaster uses create-react-app's [proxy](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#proxying-api-requests-in-development) setting. If you are developing on a remote server, such as an AWS instance, simply set the "HOST" variable to your hostname in a file called `.env.development`. An example file is provided in the project repo.
