#!/usr/bin/env node
const fs = require("fs");
const iq = require("inquirer");

const qAddUser = [
  {
    name: "user",
    message: "Enter the User's name (To cancel press ENTER):",
  },
  {
    type: "list",
    name: "gender",
    message: "Choose the User's gender from list:",
    choices: ["male", "female"],
    when: (answers) => answers.user.length,
  },
  {
    name: "age",
    message: "Enter the User's age:",
    when: (answers) => answers.user.length,
    validate: (input) => {
      if (isNaN(input) || +input <= 0) return "Please, enter positive number";
      return true;
    },
  },
];

const qConfirmSearch = [
  {
    type: "confirm",
    name: "isSearch",
    message: "Would you like to search values in DB?",
  },
];

const qSearch = [
  {
    name: "searchInput",
    message: "Enter name you wanna find in DB:",
  },
];

recursiveAsyncPrompt();

function recursiveAsyncPrompt() {
  iq.prompt(qAddUser).then((answers) => {
    if (answers.user.length) {
      addUser(answers);
      recursiveAsyncPrompt();
    } else {
      iq.prompt(qConfirmSearch).then((answers) => {
        if (answers.isSearch) readDBandSearch();
        else exit();
      });
    }
  });
}

function readDBandSearch() {
  fs.readFile("bin/db.txt", "utf-8", (err, data) => {
    if (err) throw err;
    const { users } = JSON.parse(data);
    console.log(users);

    iq.prompt(qSearch).then((answers) => {
      searchUser(answers.searchInput);
    });
  });
}

function addUser(userData) {
  fs.readFile("bin/db.txt", "utf-8", (err, data) => {
    if (err) throw err;
    const separator = data.includes('"}') ? "," : "";
    const updatedData =
      data.slice(0, data.indexOf("]")) +
      separator +
      "\n\t" +
      JSON.stringify(userData) +
      data.slice(data.indexOf("]"));

    fs.writeFile("bin/db.txt", updatedData, (err) => {
      if (err) throw err;
    });
  });
}

function searchUser(searchInput) {
  fs.readFile("bin/db.txt", "utf-8", (err, data) => {
    if (err) throw err;

    const { users } = JSON.parse(data);
    const usersMatch = users.filter(
      ({ user }) => user.toLowerCase() === searchInput.toLowerCase()
    );
    console.log(usersMatch.length ? usersMatch : "No matches found");
  });
}

function exit() {
  console.log("Good bye!");
  process.exit();
}
