// Функция для отправки данных на сервер при регистрации
function registerUser(username, password) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/registration');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.status === 200) {
            console.log('Пользователь успешно зарегистрирован');
            // Показать сообщение о успешной регистрации
            showMessage('Регистрация успешно завершена');
        } else if (xhr.status === 409) {
            console.error('Пользователь с таким именем уже существует');
            // Показать сообщение о существующем пользователе
            showMessage('Пользователь с таким именем уже существует');
        } else {
            console.error('Ошибка при регистрации пользователя:', xhr.statusText);
            // Показать сообщение об ошибке
            showMessage('Ошибка при регистрации пользователя');
        }
    };
    xhr.onerror = function() {
        console.error('Ошибка при отправке запроса');
        // Показать сообщение об ошибке
        showMessage('Ошибка при отправке запроса');
    };
    const data = JSON.stringify({ username: username, password: password });
    xhr.send(data);
}

// Функция для отображения сообщения на странице
function showMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    document.body.appendChild(messageElement);
}

// Получаем данные формы при ее отправке
const form = document.getElementById('registrationForm');
form.addEventListener('submit', function(event) {
    event.preventDefault(); // Предотвращаем отправку формы по умолчанию
    const username = form.elements.username.value;
    const password = form.elements.password.value;
    registerUser(username, password); // Вызываем функцию регистрации пользователя
});
