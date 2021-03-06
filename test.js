const {rules: {_: rule}} = require('.');
const {RuleTester} = require('eslint');
const dedent = require('dedent');

const invalidOrderErrorMessage = 
  'Lines between \"start-enforce-alphabetization\" and \"end-enforce-alphabetization\" should be ordered. ' + 
    'To see the proper ordering, rerun this command with env var `ESLINT_ALPHABETIZE_DEBUG=true`.';

// Bug in the quotes rule: https://github.com/eslint/eslint/issues/9433.
/* eslint-disable quotes */
const invalidStartMessage = 
`There is already a "start-enforce-alphabetization" block open, so it's invalid to have a start here.`;
const invalidEndMessage = `There is no "start-enforce-alphabetization" open, so it's invalid to have an end here.`;
/* eslint-enable quotes */

const runTest = (ruleTester, extraTests = {valid: [], invalid: []}) => {

  const prepareTestCaseString = codeString => dedent(codeString.trim());
  const prepareTestCases = testCases => testCases.map(testCase => {
    if (typeof testCase === 'string') {
      return prepareTestCaseString(testCase);
    }
    const {code, ...rest} = testCase;
    return {
      code: prepareTestCaseString(code),
      ...rest
    };
  });

  const ruleName = extraTests.testPrefix ? `_ ${extraTests.testPrefix}` : '_';
  
  ruleTester.run(ruleName, rule, {
    valid: prepareTestCases([
      'const a = 1; const b = 2;',
      'const b = 1; const a = 2;',
      
      `
        // Sorting only applies in designated blocks.
        let a;
        let outOfOrder;
        let b; 
  
        // start-enforce-alphabetization
        const c = 1; 
        const d = 2;
        // end-enforce-alphabetization
      `,

      `
        // Sorting works for array members 
        const arr = [
          // start-enforce-alphabetization
          a(),
          b(),
          c()
          // end-enforce-alphabetization
        ]
      `,

      `
        // Sorting works for method arguments
        f(
          // start-enforce-alphabetization
          a,
          b,
          c
          // end-enforce-alphabetization
        )
      `,
  
      `
        // Sorting only applies to top-level nodes.
        // start-enforce-alphabetization
        function a() {
          let z;
          let a;
        }
        function c() {}
        // end-enforce-alphabetization
      `,

      {
        code: `
          // Function call
          // start-enforce-alphabetization:numeric
          require('11-z');
          require('100-a');
          require('111-a')
          // end-enforce-alphabetization
        `
      },

      {
        code: `
          // Numeric mode, but some entries don't have numbers.
          // start-enforce-alphabetization:numeric
          require('100-a');
          require('111-a')
          require('a');
          // end-enforce-alphabetization
        `
      },

      {
        code: `
          // Numeric mode, but some entries don't start with numbers.
          // start-enforce-alphabetization:numeric
          require('100-a');
          require('111-a')
          require('a');
          require('a-1');
          require('a-2');
          // end-enforce-alphabetization
        `
      },

      ...extraTests.valid
    ]),
    invalid: prepareTestCases([
      {
        code: `
          // Function call
          // start-enforce-alphabetization:numeric
          require('100-a');
          require('11-z');
          require('111-z')
          // end-enforce-alphabetization
        `,
        errors: [{message: invalidOrderErrorMessage, line: 3, column: 1, endLine: 3, endColumn: 18}]
      },
      {
        code: `
          // VariableDeclaration
          // start-enforce-alphabetization
          const b = 1; 
          const a = 2;
          // end-enforce-alphabetization
        `,
        errors: [{message: invalidOrderErrorMessage, line: 3, column: 1, endLine: 3, endColumn: 13}]
      },
      {
        code: `
          // FunctionDeclaration
          // start-enforce-alphabetization
          function a() {}
          function c() {}
          function b() {}
          // end-enforce-alphabetization
        `,
        errors: [{message: invalidOrderErrorMessage, line: 4, column: 1, endLine: 4, endColumn: 16}]
      },
      {
        code: `
          // Two starts
          // start-enforce-alphabetization
          // start-enforce-alphabetization
        `,
        errors: [{message: invalidStartMessage, line: 3, column: 1, endLine: 3, endColumn: 33}]
      },
      {
        code: `
          // End with no start
          // end-enforce-alphabetization
        `,
        errors: [{message: invalidEndMessage, line: 2, column: 1, endLine: 2, endColumn: 31}]
      },
      {
        code: `
          // Start with no end
          // start-enforce-alphabetization
        `,
        errors: [{
          message: 'This "start-enforce-alphabetization" does not have a "end-enforce-alphabetization".', 
          line: 2, column: 1, endLine: 2, endColumn: 33
        }]
      },
      {
        code: `
          // Alphabetization only applies to enforced section.
          let a;
          let outOfOrder;
          let b; 
  
          // start-enforce-alphabetization
          const d = 2;
          const c = 1; 
          // end-enforce-alphabetization
        `,
        errors: [{message: invalidOrderErrorMessage, line: 7, column: 1, endLine: 7, endColumn: 13}]
      },
      {
        code: `
          // Sorting works for array members 
          const arr = [
            // start-enforce-alphabetization
            b(),
            a(),
            c()
            // end-enforce-alphabetization
          ]
        `,
        errors: [{message: invalidOrderErrorMessage, line: 4, column: 3, endLine: 4, endColumn: 6}]
      },
      {
        code: `
          // Sorting works for method arguments
          f(
            // start-enforce-alphabetization
            b,
            a,
            c
            // end-enforce-alphabetization
          )
        `,
        errors: [{message: invalidOrderErrorMessage, line: 4, column: 3, endLine: 4, endColumn: 4}]
      },
      ...extraTests.invalid
    ])
  });
};

runTest(new RuleTester({
  parserOptions: {ecmaVersion: 2019}, 
  parser: require.resolve('@typescript-eslint/parser')
}), {
  valid: [`
    // Enum members
    const enum E {
      // start-enforce-alphabetization
      A,
      B,
      C
      // end-enforce-alphabetization
    }
  `],
  invalid: [{
    code: `
      // Enum members
      const enum E {
        // start-enforce-alphabetization
        B,
        A,
        C
        // end-enforce-alphabetization
      }
    `,
    errors: [{message: invalidOrderErrorMessage, line: 4, column: 3, endLine: 4, endColumn: 4}]
  }],
  testPrefix: 'typescript parser'
});

runTest(new RuleTester({
  parserOptions: {ecmaVersion: 2019}
}));