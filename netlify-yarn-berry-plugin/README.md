Adapted from https://github.com/piecyk/yarn-berry-netlify-plugin

# netlify-yarn-berry-plugin

This plugin creates a workaround for netlify yarn3 issues, till https://github.com/netlify/build-image/issues/612 is resolved.

# Usage

As the plugin needs to run before fetching modules, can't be resolved from registry. Maybe as git submodule?

Then include it into `netlify.toml` file. Corepack is used for resolving yarn, and because of that supported node version is `>=16`. Next we need disable default npm install using NPM_FLAGS version hack.

```toml
[build.environment]
  NODE_VERSION = "16"
  NPM_FLAGS = "--version"

[[plugins]]
  package = "/netlify-yarn-berry-plugin"
```

We cannot use NETLIFY_USE_YARN because of https://github.com/netlify/build-image/issues/779

Set yarn version in packageManager in package.json, latest is `"packageManager": "yarn@3.2.1"`
