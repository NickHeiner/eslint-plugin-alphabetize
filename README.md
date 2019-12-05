# eslint-plugin-alphabetize
Enforce that any arbitrary code block is alphabetized.

## Usage
### When to Use This
If you have a one-off section of your code where you'd like every statement to be alphabetized. For instance:

Without this plugin, you have to use comments to enforce your convention. It's easily missed or incorrectly followed.
```js
readConfig('./general-config.json');

// Please keep this section alphabetized
readConfig('./config-site-a.json')
readConfig('./config-site-c.json')
readConfig('./config-site-b.json')
// Please keep this section alphabetized
```

With this plugin, you can enforce it through lint:
```js
readConfig('./general-config.json');

// start-enforce-alphabetization
readConfig('./config-site-a.json')
readConfig('./config-site-b.json')
readConfig('./config-site-c.json')
// end-enforce-alphabetization
```

### When Not to Use This
Don't use it for code where you consistently alphabetize. For instance, do not use this for `import` or `require` statements at the top of your file. It would be a pain to wrap every `import` block in your codebase in this rule's directives. Instead, use something like [`eslint-plugin-import`](https://www.npmjs.com/package/eslint-plugin-import).

If you want to enforce that object keys are sorted for only certain objects, use [`sort-keys`](https://eslint.org/docs/rules/sort-keys):

```js
/* eslint sort-keys:error */
/* eslint-disable sort-keys */

const unsortedObject = {Z, B, A};

/* eslint-enable sort-keys */
const sortedObject = { A, B, C};
/* eslint-disable sort-keys */
```

### Usage
Wrap the section you want to be alphabetized in a pair of directive comments:

```js
// start-enforce-alphabetization
function a() {
  // Alphabetization is only enforced at the top level where the directive comments occur.
  // The following is not a violation:
  let z;
  let a;
}
function b() {}
function c() {}
// end-enforce-alphabetization
```

#### Numeric Sorting
Sometimes, you want to sort by a number that appears on each line, instead of considering the entire string lexicographically. Imagine you have a series of requires for AB tests:

```js
require('test-123-no-more-buttons');
require('test-456-hella-buttons');
require('test-1234-all-buttons-are-blink-tags');
```

Lexicographic sort would consider `1234` to come before `456`. But in this case, readers may find it more intuitive to sort the test id numerically, producing the ordering above. To achieve this, use the `:numeric` directive:

```js
// start-enforce-alphabetization:numeric
require('test-123-no-more-buttons');
require('test-456-hella-buttons');
require('test-1234-all-buttons-are-blink-tags');
// end-enforce-alphabetization

// What it would be without numeric:
// start-enforce-alphabetization
require('test-123-no-more-buttons');
require('test-1234-all-buttons-are-blink-tags');
require('test-456-hella-buttons');
// end-enforce-alphabetization
```

The numeric directive works by looking for the first match of `/(\d?)/` in each statement. If the result of `parseInt(regexMatch)` is `NaN`, then as a fallback, the entire statement is sorted as a string.

## Design Considerations
I'm not thrilled with introducing the custom `(start|end)-enforce-alphabetization` directives. However, if we only use eslint directives, it's pretty cumbersome to use:

```js
/* eslint alphabetize/_: error */
/* eslint-disable alphabetize/_ */

let e;
let outOfOrder;
let b; 

/* eslint-enable alphabetize/_ */
const d = 2;
const c = 1; 
/* eslint-disable alphabetize/_ */

const a = 1; 
```

## Limitations
1. Sort criteria is not configurable.
1. Nesting sorted blocks is not permitted.
1. Sorting only applies to the top-level node in the scope in which the comment appears. It also does not apply to comments. For instance, the following will be considered valid:
    ```js
    // start-enforce-alphabetization
    readConfig('./config-site-a.json')
    // readConfig('./config-site-z.json')
    readConfig('./config-site-c.json')
    // end-enforce-alphabetization
    ```
1. Doesn't do a nice diff of the lines that are out of sort order; only the first unsorted line will be flagged.
1. No fixer.
1. The feedback to the user explaining the problem is not great. It works better when you have an already-sorted block and you need to avoid messing it up. It's more cumbersome when you're sorting a previously unsorted big block.

## Future Ideas
1. Should EOF implicitly be an endDirective?

## Local Dev
If you're developing this module locally, run `yarn run set-up-demo`.