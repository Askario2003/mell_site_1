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


// Добавляем обработчик события для обновления баланса на странице пользователя
socket.on('updateBalance', function(newBalance) {
    // Преобразуем новый баланс в строку перед передачей в функцию
    const balanceString = newBalance.toString();
    // Обновляем элемент на странице с новым балансом
    document.getElementById('coin-count').textContent = balanceString + ' монет';
});