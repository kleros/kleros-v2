[![Netlify Status](https://api.netlify.com/api/v1/badges/df66259a-85bc-4cce-895e-f7d76d7883cf/deploy-status)](https://app.netlify.com/sites/kleros-v2-prealpha1/deploys)
[![Web Link](https://img.shields.io/badge/kleros--v2--prealpha1-purple?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAAAXNSR0IArs4c6QAAAIRlWElmTU0AKgAAAAgABQESAAMAAAABAAEAAAEaAAUAAAABAAAASgEbAAUAAAABAAAAUgEoAAMAAAABAAIAAIdpAAQAAAABAAAAWgAAAAAAAABIAAAAAQAAAEgAAAABAAOgAQADAAAAAQABAACgAgAEAAAAAQAAAA6gAwAEAAAAAQAAAA4AAAAATspU+QAAAAlwSFlzAAALEwAACxMBAJqcGAAAAVlpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDYuMC4wIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KGV7hBwAAAsZJREFUKBVdUl1IU2EYfr/vnO1sxzPnNiPbj9NGZ1qog7IocIGkN91EhBdBt0KXDpfkRViKIFFdCbHoIiioXXTVjdBNiCLVoqXDTHNabDrT/Zz9cHZ++86gmz74Pr6/53nf530fBP+NaHQy5HA4JUE4rImiWOd5XgwEAlKpVBJHRkZU8h2RqRsLjI6OmmKxmDwxcXd8L7P/kKZpjbNxaqkkSPn8kSQrcjXIB5kmjrs1O/tgYWpqikb/QGNj0WFJrC8kvyb1H+tbcLqnC7k9bqAoisRA4HQ64fAgt/jq9cswiUVRiURCm5+f931Lri0qimLOZrOaUC7jvb2cXqvVCMChO1pa9Gq5omay2c4b166/X15Z3iV0AFaLbalcLnubWFZOp3fozkAH9PSeQX5/O6pLdSTVJcQwjEYI8J/8kT2VWo2jiTuTb7a30yOqpkoWM2PWNA0sFgsIggAkOmQyGQiHw7D5c0tv9/lQ2/E2YDmmi8aAfV6Ph8hAVKFQgEKxAMlkEiqVCqiqBi6XAzDGQGSglc8JZXBggKZoRxRjE57b3Nw0PuoWhgF7sx0cTgfoug4MYwarlW3sZVkmonS0vrEBpEuDeGbm/rtWl2ubRKR3f//SKtUK9PX2QSgUgvxRsZG2qqqQyR1A9ykeXejvhxYbdxsTgGp32p+zLGuko35YWob0zg54SPpXhgaB4ziQFQUuX7oonezsxJJcfzL3aG4BG1X1+30vSNVETdNpisLKypeEtvLpo2a3N+ter9doh0yEmXMH+2uxZ08jBgYbLohEIhmbzfb2WGsr6uZ5+urQMD5/9hw2mczIarUiRZFNuYMcaVHopgEyMHQqldKNQ7lafXzC7Q4GeR4TTbaSIDSVikW2Wq2YOvwdLCGITE/fWzWcRoByw6ukgkQqahAYJPF4nCIGt5B7CzEGJwqidXxy/Lvx9m/8BaVBSSE6BZqAAAAAAElFTkSuQmCC)](https://kleros-v2-prealpha1.netlify.app)

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
