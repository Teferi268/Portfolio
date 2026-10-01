const calculatorHistory = document.getElementById('calculatorHistory');
const calculatorOutput = document.getElementById('calculatorOutput');
const calculatorButtons = document.querySelectorAll('.calculator-button');

let expression = '';
let result = '0';

function formatDisplayValue(value) {
  return value.replace(/\*/g, 'X').replace(/\./g, ',');
}

function updateDisplay() {
  calculatorHistory.textContent = expression ? formatDisplayValue(expression) : '0';
  calculatorOutput.textContent = result;
}

function clearAll() {
  expression = '';
  result = '0';
  updateDisplay();
}

function clearEntry() {
  expression = expression.slice(0, -1);
  result = expression ? result : '0';
  updateDisplay();
}

function appendValue(value) {
  const operators = ['+', '-', '*', '/'];

  if (value === '.' && expression.split(/\+|\-|\*|\//).pop().includes('.')) {
    return;
  }

  if (operators.includes(value) && operators.includes(expression.slice(-1))) {
    expression = expression.slice(0, -1) + value;
  } else {
    expression += value;
  }

  result = expression ? formatDisplayValue(expression) : '0';
  updateDisplay();
}

function evaluateExpression() {
  if (!expression) {
    return;
  }

  try {
    const safeExpression = expression.replace(/,/g, '.');
    const computedValue = Function(`"use strict"; return (${safeExpression});`)();

    if (!Number.isFinite(computedValue)) {
      throw new Error('Invalid calculation');
    }

    result = Number(computedValue.toFixed(10)).toString().replace(/\./g, ',');
    expression = result.replace(/,/g, '.');
    updateDisplay();
  } catch {
    result = 'Erreur';
    updateDisplay();
  }
}

calculatorButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const { action, value } = button.dataset;

    if (action === 'clear') {
      clearAll();
      return;
    }

    if (action === 'clear-entry') {
      clearEntry();
      return;
    }

    if (action === 'backspace') {
      expression = expression.slice(0, -1);
      result = expression ? formatDisplayValue(expression) : '0';
      updateDisplay();
      return;
    }

    if (action === 'equals') {
      evaluateExpression();
      return;
    }

    if (value) {
      appendValue(value);
    }
  });
});

document.addEventListener('keydown', (event) => {
  const allowedKeys = '0123456789+-/*.,';

  if (allowedKeys.includes(event.key)) {
    appendValue(event.key === ',' ? '.' : event.key);
    return;
  }

  if (event.key === 'Enter') {
    event.preventDefault();
    evaluateExpression();
    return;
  }

  if (event.key === 'Backspace') {
    expression = expression.slice(0, -1);
    result = expression ? formatDisplayValue(expression) : '0';
    updateDisplay();
  }
});

updateDisplay();