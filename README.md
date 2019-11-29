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
Don't use it for code where you consistently alphabetize. For instance, do not use this for `import` or `require` 
statements at the top of your file. It would be a pain to wrap every `import` block in your codebase in this rule's 
directives. Instead, use something like [`eslint-plugin-import`](https://www.npmjs.com/package/eslint-plugin-import).

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

## Design Considerations
I'm not thrilled with introducing the custom `(start|end)-enforce-alphabetization` directives. However, if we only use
eslint directives, it's pretty cumbersome to use:

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
1. Sorting only applies to the top-level node in the scope in which the comment appears.
1. Doesn't do a nice diff of the lines that are out of sort order; only the first unsorted line will be flagged.
1. No fixer.

## Future Ideas
1. Should EOF implicitly be an endDirective?