'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

// js ,1111 | jd, 2222 are the username / password combinations available.

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.abs(date2 - date1) / (1000 * 60 * 60 * 24); // we now get back the days.

  const daysPassed = calcDaysPassed(new Date(), date);
  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${Math.floor(daysPassed)} days ago`;
  // else {
  //   const day = `${date.getDate()}`.padStart(2, 0);
  //   const month = `${date.getMonth() + 1}`.padStart(2, 0);
  //   const year = date.getFullYear();
  //   return `${day}/${month}/${year}`;
  // }

  return new Intl.DateTimeFormat(locale).format(date);
};

// function to take care of currency formatting automatically
const formatCur = function (value, locale, currency) {
  //Internationalizing Numbers
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const combinedMovsDates = acc.movements.map((mov, i) => ({
    movement: mov,
    movementDate: acc.movementsDates.at(i),
  }));

  if (sort) combinedMovsDates.sort((a, b) => a.movement - b.movement);

  // const movs = sort ? acc.movements.slice().sort((a, b) => a - b) : acc.movements;

  combinedMovsDates.forEach(function (obj, i) {
    const { movement, movementDate } = obj;
    const type = movement > 0 ? 'deposit' : 'withdrawal';

    // Date of Transactions
    const date = new Date(movementDate);
    const displayDate = formatMovementDate(date, acc.locale);

    //internationalizing the currency
    const formattedMov = formatCur(movement, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
          i + 1
        } ${type}</div>
        <div class="movments__date">${displayDate}</div> 
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

// TOTAL MONEY DISPLAY
const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

// DISPLAYING INCOMES, OUTCOMES and INTEREST
const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

//COUNTDOWN TIMER
const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    // In each call, print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;

    // When 0 seconds, stop timer and log out user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }

    //Decrease 1s
    time--; // comes after all the logic to prevent premature execution of logout
  };

  // Set time to 5 minutes
  let time = 300; // 100 seconds

  // Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer; // global variables needed for repeated executions

// LOGIN MECHANISM
btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value,
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    //Create Current Date under Current balance

    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: '2-digit', // long, numeric
      year: 'numeric',
    };
    const locale = currentAccount.locale; // per  browser
    console.log(locale);

    labelDate.textContent = new Intl.DateTimeFormat(locale, options).format(
      now,
    );

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    //Timer for login begins here
    if (timer) clearInterval(timer); // this logic prevents overlapping timers
    timer = startLogOutTimer();

    // Update UI
    updateUI(currentAccount);
  }
});

// TRANSFERING MONEY BETWEEN ACCOUNTS
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value,
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);

    // Reset timer when user active
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

//LOAN
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // 3 second delay before loan goes through
    setTimeout(function () {
      // Add movement
      currentAccount.movements.push(amount);

      // Add Loan date
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);

      // Reset timer when user active
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 3000);
  }
  inputLoanAmount.value = '';
});

// CLOSING / CLOSE ACCOUNT
btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username,
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

/*
console.log(23 === 23.0)

// Base 10 - 0 to 9. 1/10 = 0.1. 3/10 = 3.3333~~
// Binary base 2 - 0 to 1

console.log(0.1 + 0.2); //output: 0.30000000000000004
console.log(0.1 + 0.2 === 0.3) //output: false

//These 2 provide the same results of turning a string to number.
//Conversion
console.log(Number('23'));
console.log(+'23')

//Parsing, the number has to come first
console.log(Number.parseInt('30px', 10)); //output: 30
console.log(Number.parseInt('e23'));//output: NaN

console.log(Number.parseFloat('2.5mm'));//output: 2.5

//check if value is NaN
console.log(Number.isNaN(20)); //output: false
console.log(Number.isNaN('20')); //output: false
console.log(Number.isNaN(+'20X')); //output: true
console.log(Number.isNaN(23 / 0)); //output: false

//Checking if value is a finite number
console.log(Number.isFinite(20)); //output: true
console.log(Number.isFinite('20')); //output: false
console.log(Number.isFinite(+'20x')); //output: false
console.log(Number.isFinite(23 / 0)); //output: false

console.log(Number.isInteger(23)); //output: true
console.log(Number.isInteger(23.0)); //output: true
console.log(Number.isInteger(23 / 0)); //output: false
*/

/*
/// MATH AND ROUNDING
console.log(Math.sqrt(25)); //output: 5
console.log(25 ** (1 / 2)); //output: 5
console.log(8 ** (1 / 3)); //output: 2

console.log(Math.max(5, 18, '23', 11, 5, '26')); //output: 26
console.log(Math.max(5, 18, '23x', 11, 5, '26')); //output: NaN

console.log(Math.min(5, 17, '1', 23, 41, 2)); //output: 1
console.log(Math.min(5, '17x', 1, 23, 41, 2)); //output: NaN

console.log(Math.PI * Number.parseFloat('10px') ** 2); // Calculate the area of a circle

console.log(Math.trunc(Math.random() * 6) + 1); // random dice

// RANDOM NUMBER GENERATOR
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
console.log(randomInt(10, 20));
console.log(randomInt(0, 3));

// Rounding Integers
console.log(Math.trunc(23.9)); //output: 23
console.log(Math.trunc(23.1)); //output: 23

console.log(Math.ceil(23.1)); //output: 24
console.log(Math.ceil(23.5)); //output: 24

console.log(Math.floor(23.2)); //output: 23
console.log(Math.floor(23.6)); //output: 23


console.log(Math.round(23.9)); //output: 24
console.log(Math.round(23.2)); //output: 23

console.log(Math.floor(-23.2)); //output: -24
console.log(Math.trunc(-23.2)); //output: -23


//Rounding Decimals
console.log((2.7).toFixed(0)); //output: 3. Always returns strings
console.log((2.7).toFixed(3)); //output: 2.700
console.log((2.345).toFixed(2)); //output: 2.34
console.log(+(2.345).toFixed(2)); //output: 2.34, now a number
*/

/*
//REMAINDER
console.log(5 % 2); //output: 1
console.log(5 / 2); //output 2.5, 5=2*2+1

console.log(8 % 3); //output: 2
console.log(8 / 3); //output: 2.666~~. 8=2*3+2

console.log(6 % 2); //output: 0
console.log(8 / 3); //output: 3

const isEven = n => n % 2 === 0;
console.log(isEven(8)); //output: true
console.log(isEven(23)); //output: false
console.log(isEven(521)); //output: false

labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    // 0, 2, 4, 6
    if (i % 2 === 0) row.style.backgroundColor = 'orangered';
    //0, 3, 6, 9
    if (i % 3 === 0) row.style.backgroundColor = 'blue'
  });
});
*/

/*
// 287,600,000,000
const diameter = 287_600_000_000; //Numeric Separator
console.log(diameter); //output: 287600000000
console.log(+'200_000') //output: NaN
*/

/*
// BIG INT
console.log(2 ** 53 - 1);//output: 9007199254740991. This is the biggest number that normal int can support safely. To increase this value you need to use BigInt.
console.log(Number.MAX_SAFE_INTEGER); //output: 9007199254740991

console.log(123913239293293192319232392392193931n); //this is the bigInt that works 100% accurately
console.log(BigInt(123913239293293192319232392392193931)); //this is the bigInt this one does not work with 100% accuracy.

// OPERATIONS
console.log(100000n + 1000000n); //output: 1100000n
console.log(846513268451465320846512089465120n + 874518462084623048632n); //works well enough...

//Operation You CANNOT DO:
const huge = 45128645231864132045120n;
const normalNum = 796123984651;
console.log(huge + normalNum); //output: Uncaught TypeError: can't convert BigInt to number
console.log(huge + BigInt(normalNum)); // this works


// EXCEPTIONS
console.log(20n > 15); //output: true
console.log(20n === 15); //output: false
console.log(20n == '20') //output: true

console.log(huge + ' IS REALLY BIG!!')

// DIVISIONS
console.log(10n / 3n); //output: 3. It basically removes the decimal part.
*/

/*
// DATES AND TIMES
// Create a date (There are 4 ways)

const now = new Date();
console.log(now);

console.log(new Date('Jul 30 2025 20:26:07'));
console.log(new Date('December 24, 2016'));
console.log(new Date(account1.movementsDates[0]));

console.log(new Date(2037, 10, 19, 15, 23, 5)); //output different dates here
console.log(new Date(2037, 10, 33));

console.log(new Date(0));
console.log(new Date(3 * 24 * 60 * 60 * 1000)); // creating a time stamp

// working with dates
const future = new Date(2037, 10, 19, 23, 15);
console.log(future);
console.log(future.getFullYear());
console.log(future.getDay());
console.log(future.getDate());
console.log(future.getHours());
console.log(future.getMinutes());
console.log(future.getSeconds());
console.log(future.toISOString());
console.log(future.getTime()); //time stamp

console.log(new Date(future.getTime())); //time stamp

console.log(Date.now()); // returns the current date

future.setFullYear(2040);
console.log(future); // the value is modified.
*/

/*
// OPERATIONS ONE CAN DO WITH DATES
const future = new Date(2037, 10, 19, 15, 23);
console.log(+future) //we have now created numbers and thus we can now do calculations
const callcDaysPassed = (date1, date2) =>
  Math.abs(date2 - date1) / (1000 * 60 * 60 * 24)
const days1 = callcDaysPassed(new Date(2037, 3, 1), new Date(2037, 3, 24));
console.log(days1); // 10 days have passed.
*/

/*
// INTERNATIONALIZING NUMBERS
const num = 192_831_293.123

const options = {
  style: 'unit',            // Determines the formatting style: 'unit', 'currency', or 'percent'.
  // Note: Only 'unit' makes use of the `unit` property.

  unit: 'mile-per-hour',    // Specifies the unit to use (only if style === 'unit').
  // Examples: 'celsius', 'kilometer-per-hour', 'liter', etc.
  // Ignored if style is 'currency' or 'percent'.

  currency: 'EUR',           // Used only when style === 'currency'.
  // Must be manually set — it is *not* inferred from the locale.

  // useGrouping: false,  //this turns off the commas / dots whatever that seperate the number

};


console.log('US:', new Intl.NumberFormat('en-US', options).format(num));//output: 192,831,293.123
console.log('GERMAN:', new Intl.NumberFormat('de-DE', options).format(num)); //output: 192.831.293,123
console.log('SYRIAN:', new Intl.NumberFormat('ar-SY', options).format(num)); //output: ١٩٢٬٨٣١٬٢٩٣٫١٢٣
console.log(navigator.language, new Intl.NumberFormat(navigator.language).format(num)); //output: en-US 192,831,293.123
*/

/*
// SETTING TIMERS

//setTimeout methods deal with 2 methods, first one is an empty function or a callback function that we set for it to call in the future, a future that we dictate using miliseconds as the second arguement. 

// setTimeout
const ingredients = ['olives', 'tomatoes'];
const pizzaTimer = setTimeout((ing1, ing2) => console.log(`Here is your pizza with ${ing1} and ${ing2}!!!`), 3000, ...ingredients) // 3 seconds wait time. Here is your pizza with olives and tomatoes!!!

console.log('Waiting....'); //asynchronous javascript

if (ingredients.includes('tomatoes')) clearTimeout(pizzaTimer); // this is how we break a Timeout so long as the timer is still on.

// setInterval
setInterval(function () {
  const now = new Date();
  console.log(now);
}, 1000 * 100) //update the time each second, not limited to 1 single execution.
*/
