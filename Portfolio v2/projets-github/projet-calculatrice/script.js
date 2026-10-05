const calculatorHistory = document.getElementById("calculatorHistory");
const calculatorOutput = document.getElementById("calculatorOutput");
const calculatorButtons = document.querySelectorAll(".calculator-button");

let expression = "";
let result = "0";
let shouldStartFresh = false;

const operators = ["+", "-", "*", "/"];

function formatDisplayValue(value) {
  return value.replace(/\*/g, "X").replace(/\./g, ",");
}

function getCurrentOperand() {
  return expression.split(/[+\-*/]/).pop() || "";
}

function updateDisplay() {
  calculatorHistory.textContent = expression ? formatDisplayValue(expression) : "0";
  calculatorOutput.textContent = result;
}

function clearAll() {
  expression = "";
  result = "0";
  shouldStartFresh = false;
  updateDisplay();
}

function backspace() {
  if (shouldStartFresh) {
    clearAll();
    return;
  }

  expression = expression.slice(0, -1);
  result = expression ? formatDisplayValue(expression) : "0";
  updateDisplay();
}

function clearEntry() {
  backspace();
}

function appendValue(value) {
  const isOperator = operators.includes(value);

  if (shouldStartFresh && !isOperator) {
    expression = "";
    result = "0";
    shouldStartFresh = false;
  }

  if (value === "." && getCurrentOperand().includes(".")) return;
  if (value === "." && (expression === "" || operators.includes(expression.slice(-1)))) {
    expression += "0";
  }

  if (isOperator) {
    shouldStartFresh = false;

    if (!expression && value !== "-") return;
    if (operators.includes(expression.slice(-1))) {
      expression = expression.slice(0, -1) + value;
    } else {
      expression += value;
    }
  } else {
    expression += value;
  }

  result = expression ? formatDisplayValue(expression) : "0";
  updateDisplay();
}

function tokenize(value) {
  const tokens = [];
  let numberBuffer = "";

  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    const previous = value[index - 1];

    if (/\d|\./.test(character) || (character === "-" && (index === 0 || operators.includes(previous)))) {
      numberBuffer += character;
      continue;
    }

    if (operators.includes(character)) {
      if (!numberBuffer || numberBuffer === "-") throw new Error("Expression incomplete");
      tokens.push(Number(numberBuffer), character);
      numberBuffer = "";
      continue;
    }

    throw new Error("Expression invalide");
  }

  if (!numberBuffer || numberBuffer === "-") throw new Error("Expression incomplete");
  tokens.push(Number(numberBuffer));

  return tokens;
}

function reduceOperations(tokens, allowedOperators) {
  const reduced = [];

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];

    if (allowedOperators.includes(token)) {
      const left = reduced.pop();
      const right = tokens[index + 1];

      if (typeof left !== "number" || typeof right !== "number") {
        throw new Error("Expression invalide");
      }

      if (token === "/" && right === 0) {
        throw new Error("Division par zero");
      }

      const computed = token === "*"
        ? left * right
        : token === "/"
          ? left / right
          : token === "+"
            ? left + right
            : left - right;

      reduced.push(computed);
      index += 1;
    } else {
      reduced.push(token);
    }
  }

  return reduced;
}

function calculate(value) {
  const tokens = tokenize(value);
  const withPriority = reduceOperations(tokens, ["*", "/"]);
  const finalTokens = reduceOperations(withPriority, ["+", "-"]);

  if (finalTokens.length !== 1 || typeof finalTokens[0] !== "number") {
    throw new Error("Expression invalide");
  }

  return finalTokens[0];
}

function evaluateExpression() {
  if (!expression) return;

  try {
    const computedValue = calculate(expression);

    if (!Number.isFinite(computedValue)) {
      throw new Error("Calcul invalide");
    }

    result = Number(computedValue.toFixed(10)).toString().replace(/\./g, ",");
    expression = result.replace(/,/g, ".");
    shouldStartFresh = true;
    updateDisplay();
  } catch {
    result = "Erreur";
    shouldStartFresh = true;
    updateDisplay();
  }
}

calculatorButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const { action, value } = button.dataset;

    if (action === "clear") {
      clearAll();
      return;
    }

    if (action === "clear-entry") {
      clearEntry();
      return;
    }

    if (action === "backspace") {
      backspace();
      return;
    }

    if (action === "equals") {
      evaluateExpression();
      return;
    }

    if (value) appendValue(value);
  });
});

document.addEventListener("keydown", (event) => {
  const allowedKeys = "0123456789+-/*.,";

  if (allowedKeys.includes(event.key)) {
    appendValue(event.key === "," ? "." : event.key);
    return;
  }

  if (event.key === "Enter" || event.key === "=") {
    event.preventDefault();
    evaluateExpression();
    return;
  }

  if (event.key === "Backspace") backspace();
  if (event.key === "Escape") clearAll();
});

updateDisplay();
