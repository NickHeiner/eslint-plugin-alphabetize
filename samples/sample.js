let a, b, c;

a('non-alphabetized section');
c();
b();

/* eslint-enable no-console */
// console.log('fak');

// start-enforce-alphabetization
a();
c();
b(); 
// end-enforce-alphabetization

// start-enforce-alphabetization
a();
b(); 
c();
c();
// end-enforce-alphabetization
