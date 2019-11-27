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
        return {
          ReturnStatement() {
          }
        }
      }
    } 
  }
}