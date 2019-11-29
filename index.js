const _ = require('lodash');

const startDirective = 'start-enforce-alphabetization';
const endDirective = 'end-enforce-alphabetization';

/**
 * Limitations:
 *  1. Sort criteria is not configurable.
 *  2. Nesting sorted blocks is not permitted.
 *  3. Sorting only applies to the top-level node in the scope in which the comment appears.
 *  4. Doesn't do a nice diff of the lines that are out of sort order; only the first unsorted line will be flagged.
 *  5. No fixer.
 *  6. Should EOF implicitly be an endDirective?
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

        return {
          // node.comments is only populated for Program, so we need to do a global scan first to find all comments.
          Program: node => {
            let activeSortedBlock = null;

            for (const {value, range: [start, end], loc} of node.comments) {
              const normalizedValue = value.trim();
              if (normalizedValue === startDirective) {
                if (activeSortedBlock) {
                  context.report({
                    loc,
                    message: `There is already a "${startDirective}" block open, ` +
                      "so it's invalid to have a start here."
                  });
                  return;
                }
                
                // getNodeByRangeIndex() appears to return null when it should really return `Program`.
                // One such case is for index = 0
                const containingNode = sourceCode.getNodeByRangeIndex(Math.max(start - 1, 0)) || node;

                activeSortedBlock = {
                  start,
                  containingNode
                };
                continue;
              }
              if (normalizedValue === endDirective) {
                if (!activeSortedBlock) {
                  context.report({
                    loc,
                    message: `There is no "${startDirective}" open, so it's invalid to have an end here.`
                  });
                  return;
                }
                activeSortedBlock.end = end;
                sortedBlocks.push(activeSortedBlock);
                activeSortedBlock = null;
              }
            }

            sortedBlocks.forEach(sortedBlock => {
              const nodesToSort = sortedBlock.containingNode.body
                .filter(({range: [start, end]}) => sortedBlock.start <= start && end <= sortedBlock.end);

              const sortedBodyNodes = _.sortBy(nodesToSort, nodeToSort => sourceCode.getText(nodeToSort));

              for (const index of _.range(nodesToSort.length)) {
                if (nodesToSort[index] !== sortedBodyNodes[index]) {
                  context.report({
                    node: nodesToSort[index],
                    message: `Lines between "${startDirective}" and "${endDirective}" should be ordered.`
                  });
                  // If we report every node that's out of order, then we'd report every node after the first unsorted
                  // one, unless we had a more sophisticated diffing algorithm.
                  return;
                }
              }
            });
          }
        }; 
      }
    }
  }
};