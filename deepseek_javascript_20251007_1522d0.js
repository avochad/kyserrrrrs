// Основной JavaScript код для всех форм

// ========== ФУНКЦИОНАЛ АВТОРИЗАЦИИ ==========
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация навигации
    initNavigation();
    
    // Инициализация форм
    initLoginForm();
    initCurrencyConverter();
    initCalculator();
    loadExchangeRates();
    loadCalculatorHistory();
});

// Навигация между формами
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Удаляем активный класс у всех ссылок
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Добавляем активный класс к текущей ссылке
            this.classList.add('active');
            
            // Прокручиваем к выбранной форме
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Форма авторизации
function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const loginResult = document.getElementById('loginResult');
    const btnText = loginForm.querySelector('.btn-text');
    const btnLoader = loginForm.querySelector('.btn-loader');
    
    // Загрузка сохраненных данных
    const savedUsername = localStorage.getItem('savedUsername');
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    
    if (savedUsername && rememberMe) {
        document.getElementById('username').value = savedUsername;
        document.getElementById('rememberMe').checked = true;
    }
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        // Валидация
        if (!username || !password) {
            showResult(loginResult, 'Пожалуйста, заполните все поля', 'error');
            return;
        }
        
        // Показать индикатор загрузки
        btnText.style.display = 'none';
        btnLoader.style.display = 'block';
        loginForm.classList.add('loading');
        
        try {
            // Имитация запроса к серверу
            await simulateServerRequest(1500);
            
            // Сохранение данных, если отмечено "Запомнить меня"
            if (rememberMe) {
                localStorage.setItem('savedUsername', username);
                localStorage.setItem('rememberMe', 'true');
            } else {
                localStorage.removeItem('savedUsername');
                localStorage.removeItem('rememberMe');
            }
            
            // Успешная авторизация
            showResult(loginResult, `Добро пожаловать, ${username}!`, 'success');
            loginForm.reset();
            
            // Сохранение в историю входов
            saveLoginHistory(username);
            
        } catch (error) {
            showResult(loginResult, 'Ошибка авторизации. Попробуйте еще раз.', 'error');
        } finally {
            // Скрыть индикатор загрузки
            btnText.style.display = 'block';
            btnLoader.style.display = 'none';
            loginForm.classList.remove('loading');
        }
    });
}

// ========== КОНВЕРТЕР ВАЛЮТ ==========
function initCurrencyConverter() {
    const currencyForm = document.getElementById('currencyForm');
    const swapButton = document.getElementById('swapCurrencies');
    const currencyResult = document.getElementById('currencyResult');
    
    // Обработчик формы
    currencyForm.addEventListener('submit', function(e) {
        e.preventDefault();
        convertCurrency();
    });
    
    // Кнопка обмена валют
    swapButton.addEventListener('click', function() {
        const fromCurrency = document.getElementById('fromCurrency');
        const toCurrency = document.getElementById('toCurrency');
        
        const temp = fromCurrency.value;
        fromCurrency.value = toCurrency.value;
        toCurrency.value = temp;
        
        // Если есть сумма, выполнить конвертацию
        if (document.getElementById('amount').value) {
            convertCurrency();
        }
    });
    
    // Автоконвертация при изменении значений
    document.getElementById('amount').addEventListener('input', debounce(convertCurrency, 500));
    document.getElementById('fromCurrency').addEventListener('change', convertCurrency);
    document.getElementById('toCurrency').addEventListener('change', convertCurrency);
}

function convertCurrency() {
    const amount = parseFloat(document.getElementById('amount').value);
    const fromCurrency = document.getElementById('fromCurrency').value;
    const toCurrency = document.getElementById('toCurrency').value;
    const resultElement = document.getElementById('currencyResult');
    
    if (!amount || amount <= 0) {
        resultElement.textContent = 'Введите сумму для конвертации';
        resultElement.className = 'result text-error';
        return;
    }
    
    // Получаем актуальные курсы
    const rates = getExchangeRates();
    const rate = rates[fromCurrency]?.[toCurrency];
    
    if (!rate) {
        resultElement.textContent = 'Курс для выбранных валют не найден';
        resultElement.className = 'result text-error';
        return;
    }
    
    const convertedAmount = (amount * rate).toFixed(2);
    const resultText = `${formatCurrency(amount, fromCurrency)} = ${formatCurrency(convertedAmount, toCurrency)}`;
    
    showResult(resultElement, resultText, 'success');
    
    // Сохранение в историю конвертаций
    saveConversionHistory(amount, fromCurrency, convertedAmount, toCurrency);
}

function loadExchangeRates() {
    const rates = getExchangeRates();
    const baseCurrency = 'RUB';
    const ratesList = document.getElementById('ratesList');
    
    if (!ratesList) return;
    
    let html = '';
    for (const [currency, rate] of Object.entries(rates[baseCurrency])) {
        if (currency !== baseCurrency) {
            html += `
                <div class="rate-item">
                    <span>1 ${baseCurrency}</span>
                    <span>${rate.toFixed(4)} ${currency}</span>
                </div>
            `;
        }
    }
    
    ratesList.innerHTML = html;
}

function getExchangeRates() {
    // В реальном приложении здесь был бы запрос к API
    return {
        'USD': { 'EUR': 0.85, 'GBP': 0.73, 'JPY': 110.0, 'CNY': 6.45, 'RUB': 75.0, 'USD': 1 },
        'EUR': { 'USD': 1.18, 'GBP': 0.86, 'JPY': 129.5, 'CNY': 7.58, 'RUB': 88.5, 'EUR': 1 },
        'GBP': { 'USD': 1.37, 'EUR': 1.16, 'JPY': 150.8, 'CNY': 8.82, 'RUB': 103.0, 'GBP': 1 },
        'JPY': { 'USD': 0.0091, 'EUR': 0.0077, 'GBP': 0.0066, 'CNY': 0.058, 'RUB': 0.68, 'JPY': 1 },
        'CNY': { 'USD': 0.155, 'EUR': 0.132, 'GBP': 0.113, 'JPY': 17.24, 'RUB': 11.63, 'CNY': 1 },
        'RUB': { 'USD': 0.0133, 'EUR': 0.0113, 'GBP': 0.0097, 'JPY': 1.47, 'CNY': 0.086, 'RUB': 1 }
    };
}

// ========== КАЛЬКУЛЯТОР ==========
let calculationHistory = [];

function initCalculator() {
    // Загрузка истории при инициализации
    loadCalculatorHistory();
    
    // Обработка ввода с клавиатуры
    document.addEventListener('keydown', handleKeyboardInput);
}

function appendToDisplay(value) {
    const display = document.getElementById('calcDisplay');
    display.value += value;
}

function clearDisplay() {
    document.getElementById('calcDisplay').value = '';
}

function deleteLast() {
    const display = document.getElementById('calcDisplay');
    display.value = display.value.slice(0, -1);
}

function calculate() {
    const display = document.getElementById('calcDisplay');
    const expression = display.value.replace(/×/g, '*').replace(/÷/g, '/');
    
    if (!expression) {
        return;
    }
    
    try {
        // Безопасное вычисление (в реальном приложении нужна более надежная валидация)
        if (/[^0-9+\-*/().]/.test(expression)) {
            throw new Error('Недопустимые символы');
        }
        
        const result = eval(expression);
        
        if (isNaN(result) || !isFinite(result)) {
            throw new Error('Недопустимая операция');
        }
        
        // Сохранение в историю
        saveToHistory(expression, result);
        
        display.value = result;
    } catch (error) {
        display.value = 'Ошибка';
        setTimeout(() => {
            display.value = expression;
        }, 1500);
    }
}

function handleKeyboardInput(e) {
    const key = e.key;
    const display = document.getElementById('calcDisplay');
    
    if (/[0-9]/.test(key)) {
        appendToDisplay(key);
    } else if (['+', '-', '*', '/'].includes(key)) {
        appendToDisplay(key === '*' ? '×' : key);
    } else if (key === '.') {
        appendToDisplay('.');
    } else if (key === 'Enter') {
        e.preventDefault();
        calculate();
    } else if (key === 'Escape') {
        clearDisplay();
    } else if (key === 'Backspace') {
        deleteLast();
    } else if (key === '(' || key === ')') {
        appendToDisplay(key);
    }
}

function saveToHistory(expression, result) {
    const historyItem = {
        expression,
        result,
        timestamp: new Date().toLocaleString()
    };
    
    calculationHistory.unshift(historyItem);
    
    // Ограничиваем историю 10 последними записями
    if (calculationHistory.length > 10) {
        calculationHistory = calculationHistory.slice(0, 10);
    }
    
    // Сохраняем в localStorage
    localStorage.setItem('calculatorHistory', JSON.stringify(calculationHistory));
    
    // Обновляем отображение истории
    updateHistoryDisplay();
}

function loadCalculatorHistory() {
    const savedHistory = localStorage.getItem('calculatorHistory');
    if (savedHistory) {
        calculationHistory = JSON.parse(savedHistory);
        updateHistoryDisplay();
    }
}

function updateHistoryDisplay() {
    const historyList = document.getElementById('historyList');
    
    if (!historyList) return;
    
    if (calculationHistory.length === 0) {
        historyList.innerHTML = '<div class="history-item">История пуста</div>';
        return;
    }
    
    historyList.innerHTML = calculationHistory.map(item => `
        <div class="history-item">
            <span>${item.expression} =</span>
            <strong>${item.result}</strong>
        </div>
    `).join('');
}

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
function showResult(element, message, type) {
    element.textContent = message;
    element.className = 'result';
    
    if (type === 'success') {
        element.classList.add('text-success');
    } else if (type === 'error') {
        element.classList.add('text-error');
    }
}

function formatCurrency(amount, currency) {
    const formatter = new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2
    });
    
    return formatter.format(amount);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function simulateServerRequest(duration) {
    return new Promise((resolve) => {
        setTimeout(resolve, duration);
    });
}

function saveLoginHistory(username) {
    const loginHistory = JSON.parse(localStorage.getItem('loginHistory') || '[]');
    
    loginHistory.unshift({
        username,
        timestamp: new Date().toLocaleString()
    });
    
    // Ограничиваем историю 5 последними входами
    if (loginHistory.length > 5) {
        loginHistory.pop();
    }
    
    localStorage.setItem('loginHistory', JSON.stringify(loginHistory));
}

function saveConversionHistory(amount, fromCurrency, convertedAmount, toCurrency) {
    const conversionHistory = JSON.parse(localStorage.getItem('conversionHistory') || '[]');
    
    conversionHistory.unshift({
        amount,
        fromCurrency,
        convertedAmount,
        toCurrency,
        timestamp: new Date().toLocaleString()
    });
    
    // Ограничиваем историю 10 последними конвертациями
    if (conversionHistory.length > 10) {
        conversionHistory.pop();
    }
    
    localStorage.setItem('conversionHistory', JSON.stringify(conversionHistory));
}

// ========== PWA ФУНКЦИОНАЛ ==========
// Проверка поддержки PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}