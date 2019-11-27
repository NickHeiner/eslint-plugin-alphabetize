const {rules: {_: rule}} = require('.');
const {RuleTester} = require('eslint');

const ruleTester = new RuleTester({parserOptions: {ecmaVersion: 2019}});
const invalidOrderErrorMessage = 
  'Lines between "start-enforce-alphabetization" and "end-enforce-alphabetization" should be ordered.';
const invalidStartMessage = 
  `There is already a "start-enforce-alphabetization" block open, so it's invalid to have a start here.`;
const invalidEndMessage = `There is no "start-enforce-alphabetization" open, so it's invalid to have an end here.`;

ruleTester.run('_', rule, {
  valid: [
    {code: 'const a = 1; const b = 2;'},
    {code: 'const b = 1; const a = 2;'},

    // Sorting only applies in designated blocks.
    {code: `
      let a;
      let outOfOrder;
      let b; 

      // start-enforce-alphabetization
      const c = 1; 
      const d = 2;
      // end-enforce-alphabetization
    `},

    // Sorting only applies to top-level nodes.
    {code: `
      // start-enforce-alphabetization
      function a() {
        let z;
        let a;
      }
      function c() {}
      // end-enforce-alphabetization
    `}
  ],
  invalid: [
    {
      code: `
        // start-enforce-alphabetization
        const b = 1; 
        const a = 2;
        // end-enforce-alphabetization
      `,
      options: [{sort: true}],
      errors: [{message: invalidOrderErrorMessage, line: 3, column: 9, endLine: 3, endColumn: 21}]
    },
    {
      code: `
        // start-enforce-alphabetization
        function a() {}
        function c() {}
        function b() {}
        // end-enforce-alphabetization
      `,
      options: [{sort: true}],
      errors: [{message: invalidOrderErrorMessage, line: 4, column: 9, endLine: 4, endColumn: 24}]
    },
    {
      code: `
        // start-enforce-alphabetization
        // start-enforce-alphabetization
      `,
      errors: [{message: invalidStartMessage, line: 3, column: 9, endLine: 3, endColumn: 41}]
    },
    {
      code: `
        // end-enforce-alphabetization
      `,
      errors: [{message: invalidEndMessage, line: 2, column: 9, endLine: 2, endColumn: 39}]
    },
    {
      code: `
        let a;
        let outOfOrder;
        let b; 

        // start-enforce-alphabetization
        const d = 2;
        const c = 1; 
        // end-enforce-alphabetization
      `,
      errors: [{message: invalidOrderErrorMessage, line: 7, column: 9, endLine: 7, endColumn: 21}]
    }
  ]
});