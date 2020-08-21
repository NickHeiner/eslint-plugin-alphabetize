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
          // node.comments is only populated for Program.
          Program: node => {
            let activeSortedBlock = null;

            // The `range` field is consistently populated with the builtin parser and with @typescript-eslint/parser.
            // The `start` and `end` fields are only available with the builtin parser.
            for (const {value, range: [start, end], loc} of node.comments) {
              const normalizedValue = value.trim();
              if (normalizedValue.startsWith(startDirective)) {
                if (activeSortedBlock) {
                  context.report({
                    loc,
                    message: `There is already a "${startDirective}" block open, ` +
                      "so it's invalid to have a start here."
                  });
                  return;
                }
                
                // getNodeByRangeIndex() appears to return null when it should really return `Program`.
                // One such case is when index = 0.
                const containingNode = sourceCode.getNodeByRangeIndex(Math.max(start - 1, 0)) || node;

                activeSortedBlock = {
                  loc,
                  start,
                  startDirective: normalizedValue,
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

            if (activeSortedBlock) {
              context.report({
                ..._.pick(activeSortedBlock, 'loc'),
                message: `This "${startDirective}" does not have a "${endDirective}".`
              });
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

              const sortParamMatch = sortedBlock.startDirective.match(new RegExp(`${startDirective}(:(numeric))?`))[2];
              const numericSort = sortParamMatch === 'numeric';
              const sortedBodyNodes = _.sortBy(nodesToSort, nodeToSort => {
                const nodeText = sourceCode.getText(nodeToSort);
                if (!numericSort) {
                  return nodeText;
                }

                const numberMatch = nodeText.match(/\d+/);

                if (!numberMatch) {
                  return nodeText;
                }

                const numberToSortBy = parseInt(numberMatch[0]);
                return _.isNaN(numberToSortBy) ? nodeText : numberToSortBy;
              });

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
                    console.log('If this section of the code were properly sorted, it would look like:');
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