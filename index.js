console.log('imported');

const startDirective = 'start-enforce-alphabetization';
const endDirective = 'end-enforce-alphabetization';

module.exports = {
  rules: {
    _: {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Ensure that a section of code is alphabetically sorted',
          category: 'Style',
          url: 'https://github.com/NickHeiner/eslint-plugin-alphabetize'
        }
      },
      create: context => {
        console.log('context');

        const alphabetizedBlocks = [];

        const handleStatement = node => {
          
        }

        return {
          Program: node => {
            let activeAlphabetizedBlock = null;

            for (const {value, start, end, loc} of node.comments) {
              const normalizedValue = value.trim();
              if (normalizedValue === startDirective) {
                if (activeAlphabetizedBlock) {
                  context.report({
                    loc,
                    message: `There is already a "${startDirective}" block open, ` +
                      "so it's invalid to have a start here."
                  })
                  return;
                }
                activeAlphabetizedBlock = {
                  start
                };
                continue;
              }
              if (normalizedValue === endDirective) {
                if (!activeAlphabetizedBlock) {
                  context.report({
                    loc,
                    message: `There is no "${startDirective} open, so it is invalid to have an end here.`
                  })
                  return;
                }
                activeAlphabetizedBlock.end = end;
                alphabetizedBlocks.push(activeAlphabetizedBlock);
                activeAlphabetizedBlock = null;
              }
            }
          }
        }
      }
    } 
  }
}