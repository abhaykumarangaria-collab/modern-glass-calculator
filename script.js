let currentInput = '0';
let previousInput = '';
let shouldResetScreen = false;

const currentDisplay = document.getElementById('current-operand');
const previousDisplay = document.getElementById('previous-operand');
const historyList = document.getElementById('history-list');
const historySidebar = document.getElementById('history-sidebar');

function updateDisplay() {
    currentDisplay.innerText = currentInput;
    previousDisplay.innerText = previousInput;
}

function appendNumber(number) {
    if (currentInput === '0' || shouldResetScreen) {
        currentInput = number;
        shouldResetScreen = false;
    } else {
        if (number === '.' && currentInput.includes('.')) return;
        currentInput += number;
    }
    updateDisplay();
}

function appendOperator(operator) {
    if (previousInput !== '') calculate();
    previousInput = `${currentInput} ${operator}`;
    shouldResetScreen = true;
    updateDisplay();
}

function clearDisplay() {
    currentInput = '0';
    previousInput = '';
    updateDisplay();
}

function deleteNumber() {
    if (currentInput === '0') return;
    currentInput = currentInput.toString().slice(0, -1);
    if (currentInput === '') currentInput = '0';
    updateDisplay();
}

function calculate() {
    if (previousInput === '' || shouldResetScreen) return;
    
    let result;
    const expression = `${previousInput} ${currentInput}`;
    
    try {
        // Replace visual symbols with math operators
        const formattedExpression = expression.replace(/÷/g, '/').replace(/×/g, '*');
        
        // Use Function instead of eval for better performance/safety
        result = new Function('return ' + formattedExpression)();
        
        // Fix floating point precision (0.1 + 0.2 issue)
        result = Math.round(result * 100000000) / 100000000;
        
        addToHistory(`${expression} = ${result}`);
        currentInput = result.toString();
        previousInput = '';
        shouldResetScreen = true;
    } catch (e) {
        currentInput = "Error";
    }
    updateDisplay();
}

// --- History Logic ---
function toggleHistory() {
    historySidebar.classList.toggle('active');
}

function addToHistory(entry) {
    const li = document.createElement('li');
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    li.innerHTML = `
        <div style="color: #00d2ff; font-size: 0.75rem; margin-bottom: 4px;">${time}</div>
        <div style="font-weight: 500;">${entry}</div>
    `;
    historyList.prepend(li);
}

function clearHistory() {
    historyList.innerHTML = '';
}

// --- Keyboard Support ---
window.addEventListener('keydown', (e) => {
    if (e.key >= 0 && e.key <= 9) appendNumber(e.key);
    if (e.key === '.') appendNumber('.');
    if (e.key === '=' || e.key === 'Enter') {
        e.preventDefault();
        calculate();
    }
    if (e.key === 'Backspace') deleteNumber();
    if (e.key === 'Escape') clearDisplay();
    if (e.key === '+') appendOperator('+');
    if (e.key === '-') appendOperator('-');
    if (e.key === '*') appendOperator('×');
    if (e.key === '/') {
        e.preventDefault();
        appendOperator('÷');
    }
});