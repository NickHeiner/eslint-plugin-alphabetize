const {rules: {_: rule}} = require('.');
const {RuleTester} = require('eslint');

const ruleTester = new RuleTester({parserOptions: {ecmaVersion: 2019}});

ruleTester.run('_', rule, {
  valid: [
    {code: 'const a = 1; const b = 2;'},
    {code: 'const b = 1; const a = 2;'}
  ],
  invalid: [
    {
      code: `
        const b = 1; const a = 2;
      `,
      options: [{sort: true}],
      errors: [{message: 'Fak'}]
    }
  ]
});