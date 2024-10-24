import mustache from "mustache";

/**
 *
 * @param template
 * @returns Variables[] returns the variables in a template string
 * @note This is a naive implementation and wil not work for complex tags, only works for {{}} and {{{}}} tags for now.
 *       Reference : https://github.com/janl/mustache.js/issues/538
 */
const retrieveVariables = (template: string) =>
  mustache
    .parse(template)
    .filter(function (v) {
      return v[0] === "name" || v[0] === "&";
    }) // add more conditions here to include more tags
    .map(function (v) {
      return v[1];
    });

export default retrieveVariables;
