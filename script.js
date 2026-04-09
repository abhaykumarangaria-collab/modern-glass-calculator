let currentInput = '0';
let previousInput = '';
let shouldResetScreen = false;
let history = JSON.parse(localStorage.getItem('calcHistory')) || [];

const currentDisplay = document.getElementById('current-operand');
const previousDisplay = document.getElementById('previous-operand');
const historyList = document.getElementById('history-list');

// Load history when page opens
window.onload = () => renderHistory();

// --- UI Features ---
function toggleTheme() {
    const body = document.body;
    const isLight = body.getAttribute('data-theme') === 'light';
    body.setAttribute('data-theme', isLight ? 'dark' : 'light');
}

// --- History Logic ---
function toggleHistory() { 
    document.getElementById('history-sidebar').classList.toggle('active'); 
}

function saveToHistory(entry) {
    try {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        history.unshift({ time, entry });
        if (history.length > 20) history.pop(); // Keep last 20 calculations
        
        localStorage.setItem('calcHistory', JSON.stringify(history));
        renderHistory();
    } catch(e) {
        console.warn("Could not save history");
    }
}

function renderHistory() {
    historyList.innerHTML = '';
    history.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div style="color: var(--accent-color); font-size: 0.75rem; margin-bottom: 4px;">${item.time}</div>
            <div style="font-weight: 500;">${item.entry}</div>
        `;
        historyList.appendChild(li);
    });
}

function clearHistory() {
    history = [];
    localStorage.removeItem('calcHistory');
    renderHistory();
}

// --- Core Math Logic ---
function updateDisplay() {
    currentDisplay.innerText = currentInput;
    previousDisplay.innerText = previousInput;
}

function appendNumber(number) {
    if (currentInput === '0' || currentInput === 'Error' || shouldResetScreen) {
        currentInput = number;
        shouldResetScreen = false;
    } else {
        if (number === '.' && currentInput.includes('.')) return;
        currentInput += number;
    }
    updateDisplay();
}

function appendOperator(operator) {
    if (currentInput === 'Error') currentInput = '0';
    if (previousInput !== '' && !shouldResetScreen) calculate();
    
    previousInput = `${currentInput} ${operator}`;
    shouldResetScreen = true;
    updateDisplay();
}

function clearDisplay() { 
    currentInput = '0'; 
    previousInput = ''; 
    shouldResetScreen = false;
    updateDisplay(); 
}

function deleteNumber() {
    if (shouldResetScreen || currentInput === 'Error') {
        clearDisplay();
        return;
    }
    currentInput = currentInput.toString().slice(0, -1);
    if (currentInput === '') currentInput = '0';
    updateDisplay();
}

function calculate() {
    if (previousInput === '') return;
    
    let result;
    const expression = `${previousInput} ${shouldResetScreen ? '' : currentInput}`;
    
    try {
        // Swap visual operators for Javascript math operators
        const formattedExpression = expression.replace(/÷/g, '/').replace(/×/g, '*');
        result = new Function('return ' + formattedExpression)();
        
        // Prevent floating point errors (e.g., 0.1 + 0.2)
        result = Math.round(result * 100000000) / 100000000;
        
        // Save the clean calculation to the sidebar
        saveToHistory(`${expression} = ${result}`);
        
        currentInput = result.toString();
        previousInput = '';
        shouldResetScreen = true;
    } catch (e) {
        currentInput = "Error";
    }
    updateDisplay();
}

// --- Keyboard Support ---
window.addEventListener('keydown', (e) => {
    if (e.key >= 0 && e.key <= 9) appendNumber(e.key);
    if (e.key === '.') appendNumber('.');
    if (e.key === '=' || e.key === 'Enter') { e.preventDefault(); calculate(); }
    if (e.key === 'Backspace') deleteNumber();
    if (e.key === 'Escape') clearDisplay();
    if (['+', '-'].includes(e.key)) appendOperator(e.key);
    if (e.key === '*') appendOperator('×');
    if (e.key === '/') { e.preventDefault(); appendOperator('÷'); }
});