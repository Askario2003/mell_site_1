// Обработчик отправки формы входа
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Предотвращаем отправку формы по умолчанию
    
    // Получаем введенные пользователем логин и пароль
    const username = this.elements.username.value;
    const password = this.elements.password.value;
    

    // Отправляем данные на сервер для аутентификации
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username, password: password })
    })
    .then(response => {
        if (response.ok) {
            console.log('Авторизация успешна');
            // Дополнительные действия при успешной авторизации, например, перенаправление на другую страницу
        } else {
            console.error('Ошибка авторизации:', response.statusText);
        }
    })
    .catch(error => {
        console.error('Ошибка сети:', error);
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // Функция для получения информации о пользователе после авторизации
    function getUserInfo() {
        fetch('/user-info', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Ошибка получения данных пользователя');
            }
        })
        .then(data => {
            // Обновляем элементы на странице с информацией о пользователе
            document.getElementById('username').textContent = data.username;
            document.getElementById('coin-count').textContent = data.coins + ' монет';
        })
        .catch(error => {
            console.error('Ошибка получения данных пользователя:', error);
        });
    }

    // Проверяем, есть ли токен в локальном хранилище при загрузке страницы
    const token = localStorage.getItem('token');
    if (token) {
        // Если токен есть, получаем информацию о пользователе
        getUserInfo();
    }

    // Добавляем обработчик для формы входа
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', event => {
        event.preventDefault(); // Предотвращаем отправку формы

        const formData = new FormData(loginForm);
        const username = formData.get('username');
        const password = formData.get('password');

        // Отправляем данные на сервер для входа
        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Ошибка входа: ' + response.statusText);
            }
        })
        .then(data => {
            // Сохраняем токен в локальном хранилище
            localStorage.setItem('token', data.token);

            // Обновляем информацию о пользователе на странице
            getUserInfo();
        })
        .catch(error => {
            console.error('Ошибка входа:', error);
        });
    });
});
// Функция для сохранения информации о пользователе в локальном хранилище
function saveUserInfoToLocalStorage(userInfo) {
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
}

// Функция для получения информации о пользователе из локального хранилища
function getUserInfoFromLocalStorage() {
    const userInfoString = localStorage.getItem('userInfo');
    return userInfoString ? JSON.parse(userInfoString) : null;
}

// Функция для отправки запроса на сервер для получения информации о пользователе
function getUserInfoFromServer() {
    fetch('/user-info', {
        headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
        }
    })
    .then(response => response.json())
    .then(userInfo => {
        saveUserInfoToLocalStorage(userInfo);
        updateUserInfoOnPage(userInfo);
    })
    .catch(error => console.error('Ошибка получения информации о пользователе:', error));
}

// Пример обновления информации о пользователе на странице при загрузке
document.addEventListener('DOMContentLoaded', () => {
    const userInfo = getUserInfoFromLocalStorage();
    if (userInfo) {
        updateUserInfoOnPage(userInfo);
    }
});








// slots !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!


// Клиентский код для отправки запроса на сервер и обработки ответа
document.getElementById('spinButton').addEventListener('click', () => {
    fetch('/spinImages', {
        method: 'POST', // Отправляем POST запрос
        headers: {
            'Content-Type': 'application/json' // Устанавливаем заголовок Content-Type
        }
    })
    .then(response => {
        if (response.ok) {
            return response.json(); // Если ответ успешен, парсим его в формат JSON
        } else {
            throw new Error('Ошибка при получении данных от сервера');
        }
    })
    .then(data => {
        console.log('Полученные пути к изображениям:', data); // Выводим полученные пути к изображениям в консоль
        displayImages(data); // Отображаем полученные изображения на странице
    })
    .catch(error => {
        console.error('Произошла ошибка:', error);
    });
});


// Функция для отображения изображений на странице
function displayImages(imagePaths) {
    const slotMachines = document.querySelectorAll('.slot-machine');
    slotMachines.forEach((slot, index) => {
        slot.innerHTML = ''; // Очищаем содержимое слота перед добавлением новых изображений
        for (let i = 0; i < imagePaths[index].length; i++) { // Используем индекс для получения данных для каждого слота
            const img = document.createElement('img');
            img.src = imagePaths[index][i]; // Получаем пути к изображениям для каждого слота
            slot.appendChild(img);
            img.style.top = `${-i * 100}px`;
            img.classList.add('falling');
        }
    });

    startAnimationTimer();
}


function startAnimationTimer() {
    animationTimer = setInterval(() => {
        const slotMachines = document.querySelectorAll('.slot-machine');
        slotMachines.forEach(slot => {
            const images = slot.querySelectorAll('img');
            const numImages = images.length; // Получаем количество изображений в текущем слоте
            let topReached = false; // Флаг для отслеживания достижения верхней границы барабана
            images.forEach((img, index) => {
                let top = parseInt(img.style.top);
                top += (numImages - 1) * 100; // Увеличиваем значение top в зависимости от количества изображений
                img.style.top = `${top}px`;
                
                // Проверяем, достигла ли верхняя картинка верхней границы барабана
                if (top >= 0 && !topReached) {
                    topReached = true;
                }
            });
            
            // Если верхняя картинка достигла верхней границы барабана, останавливаем анимацию
            if (topReached) {
                stopAnimation();
            }
        });
    }, 100); // Проверяем каждые 100 миллисекунд
}



function stopAnimationAndRemoveImages() {
    const slotMachines = document.querySelectorAll('.slot-machine');
    slotMachines.forEach(slot => {
        const images = slot.querySelectorAll('img');
        const slotBounds = slot.getBoundingClientRect(); // Получаем границы слот-машины
        images.forEach(img => {
            const imgBounds = img.getBoundingClientRect(); // Получаем границы изображения
            // Проверяем, находится ли изображение внутри границ слот-машины
            if (
                imgBounds.top >= slotBounds.top && 
                imgBounds.bottom <= slotBounds.bottom &&
                imgBounds.left >= slotBounds.left &&
                imgBounds.right <= slotBounds.right
            ) {
                // Если изображение находится внутри слот-машины, оставляем его
            } else {
                // Если изображение выходит за пределы слот-машины, удаляем его из DOM
                img.remove();
            }
        });
    });
}


function stopAnimation() {
    clearInterval(animationTimer);
    setTimeout(() => {
        stopAnimationAndRemoveImages();
    }, 2000); // Позволяет завершиться анимации перед удалением изображений
}




// Функция для получения случайного пути к изображению фрукта
function getRandomFruitImage() {
    const fruitImages = ['public/images/banana.png', 'public/images/bomb.png', 'public/images/cherry.png', 'public/images/watermelon.png'];
    return fruitImages[Math.floor(Math.random() * fruitImages.length)];
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

// Добавляем обработчик события для обновления баланса на странице пользователя
socket.on('updateBalance', function(newBalance) {
    // Преобразуем новый баланс в строку перед передачей в функцию
    const balanceString = newBalance.toString();
    // Обновляем элемент на странице с новым балансом
    document.getElementById('coin-count').textContent = balanceString + ' монет';
});