console.log('imported');

const startDirective = 'start-enforce-alphabetization';
const endDirective = 'end-enforce-alphabetization';

/**
 * Limitations:
 *  1. Sort criteria is not configurable.
 *  2. Nesting sorted blocks is not permitted.
 *  3. Sorting only applies to the top-level node in the scope in which the comment appears.
 */

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
        const sortedBlocks = [];
        const sourceCode = context.getSourceCode();

        // console.log({node: sourceCode.getNodeByRangeIndex(20)});

        return {
          // node.comments is only populated for Program, so we need to do a global scan first to find all comments.
          Program: node => {
            let activeSortedBlock = null;

            for (const {value, start, end, loc} of node.comments) {
              const normalizedValue = value.trim();
              if (normalizedValue === startDirective) {
                if (activeSortedBlock) {
                  context.report({
                    loc,
                    message: `There is already a "${startDirective}" block open, ` +
                      "so it's invalid to have a start here."
                  })
                  return;
                }
                activeSortedBlock = {
                  start,
                  containingNode: sourceCode.getNodeByRangeIndex(end + 1)
                };
                continue;
              }
              if (normalizedValue === endDirective) {
                if (!activeSortedBlock) {
                  context.report({
                    loc,
                    message: `There is no "${startDirective} open, so it is invalid to have an end here.`
                  })
                  return;
                }
                activeSortedBlock.end = end;
                sortedBlocks.push(activeSortedBlock);
                activeSortedBlock = null;
              }
            }
          },
          // '[body]': node => {
          //   if (!Array.isArray(node.body)) {
          //     return;
          //   }
            
          //   sortedBlocks
          //     .filter(({start, end}) => start >= node.start && end <= node.end)
          //     .forEach(sortedBlock => {
          //       if (!sortedBlock.narrowestScope) {
          //         sortedBlock.narrowestScope = {start: node.start, end: node.end};
          //       }
          //       const smallestPreviouslyFoundScopeSizeForBlock = 
          //         sortedBlock.narrowestScope.end - sortedBlock.narrowestScope.start; 
          //       const currentScopeSize = node.end - node.start;

          //       if (currentScopeSize < smallestPreviouslyFoundScopeSizeForBlock) {
          //         sortedBlock.narrowestScope.start = node.start;
          //         sortedBlock.narrowestScope.end = node.end;
          //       }
          //     });
          // },
          '[body]:exit': node => {
            console.log(sortedBlocks);
            // const blocksToSort = sortedBlocks
            //   .filter(({narrowestScope}) => narrowestScope.start === node.start && narrowestScope.end === node.end)
            //   // To improve perf, traverse node.body in a single pass, instead of once per sortedBlock.
            //   .map(({start, end}) => node.body.filter(bodyElem => bodyElem.start >= start && bodyElem.end <= end))
            //   .forEach(blocks => {
            //     console.log(blocks[0]);
            //   });
          }
        }
      }
    } 
  }
}