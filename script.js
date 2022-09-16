"use strict";

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKPAY APP

// Data
const account1 = {
  owner: "Paul Fadayo",
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    "2022-08-20T21:31:17.178Z",
    "2022-08-23T07:42:02.383Z",
    "2022-08-28T09:15:04.904Z",
    "2022-09-11T10:17:24.185Z",
    "2022-09-12T14:11:59.604Z",
    "2022-09-13T17:01:17.194Z",
    "2022-09-14T23:36:17.929Z",
    "2022-09-16T10:51:36.790Z",
  ],
  currency: "EUR",
  locale: "pt-PT", // de-DE
};

const account2 = {
  owner: "Guest Account",
  movements: [5000, 3400, -150, -790.54, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    "2022-08-28T13:15:33.035Z",
    "2022-08-30T09:48:16.867Z",
    "2022-08-31T06:04:23.907Z",
    "2022-09-11T14:18:46.235Z",
    "2022-09-12T16:33:06.386Z",
    "2022-09-14T14:43:26.374Z",
    "2022-09-15T18:49:59.371Z",
    "2022-09-16T12:01:20.894Z",
  ],
  currency: "USD",
  locale: "en-US",
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

/////////////////////////////////////////////
//FUNCTIONS

// Creating the movement date function
const formatMovementDate = function (date) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return "Today";
  if (daysPassed === 1) return "Yesterday";
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    const day = `${date.getDate()}`.padStart(2, 0);
    const month = `${date.getMonth() + 1}`.padStart(2, 0);
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  }
};

// creating the html templates & the transaction movements to the DOM
const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = "";

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? "deposit" : "withdrawal";

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date);

    // Creating HTML template
    const html = `
          <div class="movements__row">
        <div class="movements__type movements__type--${type}">${i + 1} ${type}
      </div>
      <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${mov.toFixed(2)}€ </div>
      </div>`;

    // Attaching the htmltemplate to the container in the DOM
    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

// Caclculating  & Displaying the balance of the account
const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce(function (acc, mov) {
    return acc + mov;
  }, 0);

  labelBalance.textContent = `${acc.balance.toFixed(2)}€`;
};

//
const calcDisplaySummary = function (acc) {
  //deposit--in
  const incomes = acc.movements
    .filter((mov) => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);

  labelSumIn.textContent = `${incomes.toFixed(2)}€`;

  //withdrawal--out
  const out = acc.movements
    .filter((mov) => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);

  labelSumOut.textContent = `${Math.abs(out).toFixed(2)}€`;

  //interest of 1.2% on each deposit, Only if interest >= 1
  const interest = acc.movements
    .filter((mov) => mov > 0)
    .map((mov) => (mov * acc.interestRate) / 100)
    .filter((mov) => mov >= 1)
    .reduce((acc, int) => acc + int, 0);

  labelSumInterest.textContent = `${interest.toFixed(2)}€`;
};

// Creating username for the accounts
const createUsernames = function (accounts) {
  accounts.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(" ")
      .map(function (name) {
        return name[0];
      })
      .join("");
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movement
  displayMovements(acc);

  // Display Balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

//////////////////////////////////////
// Event handlers
let currentAccount;

// Login
btnLogin.addEventListener("click", function (e) {
  // Preventing form from submiting
  e.preventDefault();

  currentAccount = accounts.find(
    (acc) => acc.username === inputLoginUsername.value
  );

  if (currentAccount?.pin === +inputLoginPin.value) {
    // display welcome message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(" ")[0]
    }`;

    // display the UI
    containerApp.style.opacity = 100;

    // Create current Date
    const now = new Date();

    const day = `${now.getDate()}`.padStart(2, 0);
    const month = `${now.getMonth() + 1}`.padStart(2, 0);
    const year = now.getFullYear();
    const hour = now.getHours();
    const min = now.getMinutes();
    const sec = now.getSeconds();

    labelDate.textContent = `${day}/${month}/${year},  ${hour}:${min}`;

    // reset login field
    inputLoginUsername.value = inputLoginPin.value = "";
    inputLoginPin.blur();

    updateUI(currentAccount);
  }
});

// Transfer Money Integration
btnTransfer.addEventListener("click", function (e) {
  e.preventDefault(); // prevent form from submiting

  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(function (acc) {
    return acc.username === inputTransferTo.value;
  });

  inputTransferTo.value = inputTransferAmount.value = "";
  inputTransferAmount.blur();

  if (
    amount > 0 &&
    currentAccount.balance >= amount &&
    receiverAcc &&
    receiverAcc?.username !== currentAccount.username
  ) {
    //doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // add and push transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // UpdateUI
    updateUI(currentAccount);
  }
});

// Loan money integration
btnLoan.addEventListener("click", function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (
    amount > 0 &&
    currentAccount.movements.some((mov) => mov >= amount * 0.1)
  ) {
    currentAccount.movements.push(amount);

    // add and push loan date
    currentAccount.movementsDates.push(new Date().toISOString());

    // UpdateUI
    updateUI(currentAccount);
  }

  inputLoanAmount.value = "";
});

// delete account integrattion
btnClose.addEventListener("click", function (e) {
  e.preventDefault();

  if (
    currentAccount.username === inputCloseUsername.value &&
    currentAccount.pin === +inputClosePin.value
  ) {
    const index = accounts.findIndex(
      (acc) => acc.username === currentAccount.username
    );
    console.log(accounts.username);
    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = "";
});

// Sort movements integraton
let sorted = false;
btnSort.addEventListener("click", function (e) {
  e.preventDefault();

  displayMovements(currentAccount, !sorted);

  sorted = !sorted;

  // background tweak for movement background during sorting
  if (sorted == true) {
    [...document.querySelectorAll(".movements__row")].forEach(function (
      row,
      i
    ) {
      if (i % 2 === 0) row.style.backgroundColor = "#fffeee";
    });
  }
});
