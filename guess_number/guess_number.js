// guess_number_client.js

// Устанавливаем соединение с сервером через сокет
const socket = io();

// Функция для отображения сообщения о начале игры
function displayGameStartMessage(message) {
    const gameStartMessageDiv = document.getElementById('game-start-message');
    gameStartMessageDiv.innerText = message;
}

// Слушаем событие 'gameStart' от сервера
socket.on('gameStart', (data) => {
    displayGameStartMessage('число загадано');
});

// Слушаем событие 'win' от сервера
socket.on('win', (data) => {
    
    displayResult(data.message, data.secretNumber);
});

// Слушаем событие 'lose' от сервера
socket.on('lose', (data) => {
    
    displayResult(data.message, data.secretNumber);
});

// Функция для отправки числа на сервер
function submitGuess() {
    const guessedNumber = document.getElementById('guess').value;
    

    // Отправляем число на сервер через сокет
    socket.emit('guess', { number: guessedNumber });
}

// Слушаем событие 'numberReceived' от сервера
socket.on('numberReceived', (data) => {
   
});

// Функция для отправки запроса на сервер с выбранной ставкой
function play() {
    const bet = document.querySelector('input[name="bet"]:checked').value;
    
    const username = localStorage.getItem('username');

    // Отправка выбранной ставки на сервер через сокет
    socket.emit('play', { username, bet });

}

// Функция для отображения информации о выигрыше или проигрыше
function displayResult(message, secretNumber) {
    const resultDiv = document.getElementById('result');
    const secretNumberDiv = document.getElementById('secret-number');

    resultDiv.innerText = message;
    if (secretNumber) {
        secretNumberDiv.innerText = "Загаданное число: " + secretNumber;
    }
}

function playAgain(){
    const betOptions = document.querySelectorAll('.bet-options input[type="radio"]');
    betOptions.forEach(option => {
        option.checked = false;
    });

    const startMessage = document.getElementById('game-start-message');
    startMessage.textContent = '';

    const result = document.getElementById('result');
    result.textContent = '';

    const secretNumber = document.getElementById('secret-number');
    secretNumber.textContent = '';

    const guessNumber = document.getElementById('guess');
    guessNumber.value = '';
}


//user info !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
document.addEventListener('DOMContentLoaded', function() {
    // Функция для получения информации о пользователе с сервера
    function getUserInfo() {
        fetch('/user-info', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        })
        .then(function(response) {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Ошибка получения данных пользователя');
            }
        })
        .then(function(data) {
            // Обновляем элементы на странице с информацией о пользователе
            document.getElementById('username').textContent = data.username;
            document.getElementById('coin-count').textContent = data.coins + ' монет';
            // Сохраняем количество монет пользователя в локальное хранилище
            localStorage.setItem('coins', data.coins);
            // Установка значения имени пользователя в локальном хранилище
            localStorage.setItem('username', data.username);
        
            // Вызываем функцию для получения актуальной информации о пользователе
            getUserInfo();
        })
        
        
        
        
        .catch(function(error) {
            console.error('Ошибка получения данных пользователя:', error);
        });
    }

    // Проверяем, есть ли токен в локальном хранилище при загрузке страницы
    var token = localStorage.getItem('token');
    if (token) {
        // Если токен есть, получаем информацию о пользователе
        getUserInfo();
    }
});