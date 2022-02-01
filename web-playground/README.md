# WebTemplate

WebTemplate is a template to quickstart web development with no config. The stack used is:

- Yarn
- Parcel
- Typescript
- React
- StyledComponents
- ESlint
- Prettier
- Husky
- CommitLint

## Usage

The first thing you need is all the files in the directory, you can achieve this in a couple of ways:

- Fork this repo and `git clone` the fork.
- Download from releases `web-template-ts.zip` (use this if your webpage is part of a bigger repo and not a repo by itself). Note that this option won't have husky, lintstaged nor commitlint.

Then inside the folder running `yarn` you will install all dependencies. The scripts provided are:

- `yarn start`: Start development server.
- `yarn build`: Build your project for production.
- `yarn clean`: Remove the previous build output.
- `yarn clear`: Remove parcel cache.
- `yarn check-style`: Runs eslint.
- `yarn check-types`: Runs typescript compiler to check compliance.

## License

[MIT](https://choosealicense.com/licenses/mit/)
