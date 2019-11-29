const _ = require('lodash');

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
              const getNodesToSort = parentNode => {
                const childNodes = parentNode.body || parentNode.elements || parentNode.arguments || parentNode.members;
                if (!childNodes) {
                  throw new Error(`eslint-plugin-alphabetize is not able to handle AST node type "${parentNode.type}"`);
                }
                return childNodes;
              };

              const nodesToSort = getNodesToSort(sortedBlock.containingNode)
                .filter(({range: [start, end]}) => sortedBlock.start <= start && end <= sortedBlock.end);

              const sortedBodyNodes = _.sortBy(nodesToSort, nodeToSort => sourceCode.getText(nodeToSort));

              for (const index of _.range(nodesToSort.length)) {
                if (nodesToSort[index] !== sortedBodyNodes[index]) {
                  context.report({
                    node: nodesToSort[index],
                    message: `Lines between "${startDirective}" and "${endDirective}" should be ordered. ` +
                      'To see the proper ordering, rerun this command with env var `ESLINT_ALPHABETIZE_DEBUG=true`.'
                  });

                  if (process.env.ESLINT_ALPHABETIZE_DEBUG === 'true') {
                    const windowSize = 4;
                    const sortedBodyNodesText = sortedBodyNodes
                      .slice(Math.max(index - windowSize, 0), index + windowSize)
                      .map(sortedNode => sourceCode.getText(sortedNode));

                    /* eslint-disable no-console */
                    console.log("A properly-ordered subset of the source code that's currently out of order:");
                    console.log(sortedBodyNodesText);
                    /* eslint-enable no-console */
                  }

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