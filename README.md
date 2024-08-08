## Ithaca Front End

First, install the NPM modules:

```bash
yarn install
```

Then, run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see a local version of the Dapp.

### Feature toggling

It's possible to disable location detection microservice by adding param
`IS_LOCATION_DETECTION_ENABLED=false` to url.
For example:
`http://localhost:3000/dashboard?IS_LOCATION_DETECTION_ENABLED=false`

Please note that this variable must be visible in the URL to function properly.
If it is not, an environment variable will be used instead.
