# eslint-plugin-alphabetize
Enforce that any arbitrary code block is alphabetized.

## Usage
### When to use this
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

### When not to use this
Don't use it for code where you consistently alphabetize. For instance, do not use this for `import` or `require` 
statements at the top of your file. It would be a pain to wrap every `import` block in your codebase in this rule's 
directives. Instead, use something like [`eslint-plugin-import`](https://www.npmjs.com/package/eslint-plugin-import).

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