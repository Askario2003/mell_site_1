// Клиентский код для подключения к игре "Камень-ножницы-бумага"
const socket = io('/rock_paper_scissors');




//поиск противников при выборе ставки и начале игры !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!


// Функция, которая будет вызываться при нажатии кнопки "Играть"
// Функция для отправки ставки и имени пользователя на сервер
function play() {
    // Получаем выбранное имя пользователя и ставку
    const username = localStorage.getItem('username');
    let bet = document.querySelector('input[name="bet"]:checked').value;
    // Отправляем на сервер информацию о выбранном имени пользователя и ставке
    socket.emit('player_bet', { username, bet });
}

// Слушаем событие о недостатке монет
socket.on('not_enough_coins', (data) => {
    // Отображаем сообщение об ошибке на странице
    const error = data.error;
    document.getElementById('game-started-message').innerText = error;
});

// Слушаем событие о добавлении в очередь
socket.on('queued', () => {
    // Показываем сообщение об ожидании на странице
    document.getElementById('waiting-message').innerText = 'Ожидание соперника...';
});

// Слушаем событие о начале игры
socket.on('game_started', (data) => {
    const { opponent, roomId } = data;
    // Удаляем сообщение об ожидании и отображаем начало игры и имя оппонента
    document.getElementById('waiting-message').innerText = '';
    document.getElementById('game-started-message').innerText = `Игра началась! Противник: ${opponent.username}`;
    // Здесь также может быть дополнительный код для обновления интерфейса игры
});

// Слушаем событие о ходе противника и результате игры
socket.on('opponent_move', (data) => {
    const { move, result, winner } = data;
    // Отображаем ход противника и результат игры на странице
    document.getElementById('opponent-move').innerText = `Ход противника: ${move}`;
    if (result === 'Поражение') {
        document.getElementById('result-text').innerText = `Поражение. Победил игрок ${winner}`;
    } else {
        document.getElementById('result-text').innerText = result;
    }
});



// выбор игроков и отправка на сервер !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!


// Обработчик нажатия на кнопку "Камень"
document.getElementById('rock-btn').addEventListener('click', () => {
    sendMove('rock');
});

// Обработчик нажатия на кнопку "Ножницы"
document.getElementById('scissors-btn').addEventListener('click', () => {
    sendMove('scissors');
});

// Обработчик нажатия на кнопку "Бумага"
document.getElementById('paper-btn').addEventListener('click', () => {
    sendMove('paper');
});

// Функция для отправки хода на сервер
function sendMove(move) {
    socket.emit('player_move', move);
}

// Слушаем событие о результате игры
socket.on('game_result', (data) => {
    const { result } = data;
    // Отобразите результат игры на странице
    document.getElementById('result-text').innerText = result;
});


function playAgain() {
    // Очищаем выбор ставки
    const betOptions = document.querySelectorAll('.bet-options input[type="radio"]');
    betOptions.forEach(option => {
        option.checked = false;
    });

    
    // Очистка сообщения ожидания
    const waitingMessage = document.getElementById('waiting-message');
    waitingMessage.textContent = '';

    // Очистка сообщения о начале игры
    const gameStartedMessage = document.getElementById('game-started-message');
    gameStartedMessage.textContent = '';

    // Очистка хода оппонента
    const opponentMove = document.getElementById('opponent-move');
    opponentMove.textContent = '';

    // Очистка хода игрока
    const ownMove = document.getElementById('own-move');
    ownMove.textContent = '';

    // Очистка текста результата
    const resultText = document.getElementById('result-text');
    resultText.textContent = '';
}



// информация о пользователе в верху экрана !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!


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