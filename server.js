const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Подключаемся к базе данных MySQL
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mell_site_bd'
});


connection.connect((err) => {
    if (err) {
        console.error('Ошибка подключения к базе данных: ' + err.stack);
        return;
    }
    console.log('Подключение к базе данных успешно с ID ' + connection.threadId);
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// Добавьте следующие строки перед объявлением app.use(express.static(path.join(__dirname, 'public')));
app.use('/registration', express.static(path.join(__dirname, 'registration')));
app.use('/guess_number', express.static(path.join(__dirname, 'guess_number')));
app.use('/rock_paper_scissors', express.static(path.join(__dirname, 'rock_paper_scissors')));

app.use(express.static(path.join(__dirname, '')));
app.use(express.static(path.join(__dirname, 'registration')));
app.use(express.static(path.join(__dirname, 'rock_paper_scissors')));
app.use(express.static(path.join(__dirname, 'guess_number')));





// const TelegramBot = require('node-telegram-bot-api');

// // Токен вашего телеграм-бота
// const token = '6172201423:AAFdvRZ9N18eBUmrZuEJmp-MQBf8Fx7sffo';
// // URL вашего веб-сайта
// const websiteUrl = 'https://cq58665.tw1.ru/';
// // Создаем экземпляр бота
// const bot = new TelegramBot(token, { polling: true });

// // Обработчик команды /start для отправки кнопки с ссылкой на веб-сайт
// bot.onText(/\/start/, (msg) => {
//     const chatId = msg.chat.id;

//     // Отправляем сообщение с кнопкой
//     bot.sendMessage(chatId, 'Привет! Нажмите на кнопку ниже, чтобы открыть веб-сайт в Telegram:', { reply_markup: {inline_keyboard: [[{text: ' заходи сюда' , web_app: {url: websiteUrl}}]]} });
// });

// // Запускаем бот
// bot.on('polling_error', (error) => {
//     console.error('Ошибка при работе бота:', error);
// });

// console.log('Бот запущен');


// Проверка существования пользователя при регистрации
app.post('/registration', (req, res) => {
    const { username, password } = req.body;
    // Проверка существования пользователя в базе данных
    const query = 'SELECT * FROM general_info WHERE username = ?';
    connection.query(query, [username], (err, results) => {
        if (err) {
            console.error('Ошибка при выполнении запроса: ' + err.stack);
            res.status(500).send('Ошибка сервера');
            return;
        }
        // Если пользователь уже существует, возвращаем информацию об этом
        if (results.length > 0) {
            res.status(409).send('Пользователь с таким именем уже существует');
            return;
        }
        // Хэширование пароля перед сохранением в базу данных
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                console.error('Ошибка при хешировании пароля: ' + err);
                res.status(500).send('Ошибка регистрации');
                return;
            }
            // Добавление нового пользователя в базу данных
            const insertQuery = 'INSERT INTO general_info (username, password, mellcoin_amount) VALUES (?, ?, 100)';
            connection.query(insertQuery, [username, hashedPassword], (err, results) => {
                if (err) {
                    console.error('Ошибка при выполнении запроса вставки: ' + err.stack);
                    res.status(500).send('Ошибка регистрации');
                    return;
                }
                console.log('Новый пользователь зарегистрирован:', username);
                res.status(200).send('Регистрация успешно завершена');
            });
        });
    });
});

// Обработчик POST-запроса для входа пользователя
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    // Проверяем существование пользователя в базе данных
    const query = 'SELECT * FROM general_info WHERE username = ?';
    connection.query(query, [username], (err, results) => {
        if (err) {
            console.error('Ошибка при выполнении запроса: ' + err.stack);
            res.status(500).send('Ошибка сервера');
            return;
        }

        // Проверяем, найден ли пользователь
        if (results.length === 0) {
            res.status(401).send('Пользователь не найден');
            return;
        }

        // Проверяем соответствие пароля
        const user = results[0];
        bcrypt.compare(password, user.password, (err, match) => {
            if (err) {
                console.error('Ошибка при сравнении паролей: ' + err);
                res.status(500).send('Ошибка сервера');
                return;
            }
            if (!match) {
                res.status(401).send('Неправильный пароль');
                return;
            }

            // Генерируем токен аутентификации
            const token = jwt.sign({ username: user.username }, 'secret_key', { expiresIn: '1h' });

            // Возвращаем токен и информацию о пользователе
            res.status(200).json({ token, username: user.username, coins: user.mellcoin_amount });
        });
    });
});


// Обработчик GET-запроса для страницы регистрации
app.get('/registration/registration.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'registration', 'registration.html'));
});

// Обработчик GET-запроса для страницы угадай число
app.get('/guess_number/guess_number.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'guess_number', 'guess_number.html'));
});

// Обработчик GET-запроса для rock_paper_scissors.html
app.get('/rock_paper_scissors/rock_paper_scissors.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'rock_paper_scissors', 'rock_paper_scissors.html'));
});

// функции для всех игр !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

// Функция для проверки баланса пользователя
function checkUserBalance(username, bet, callback) {
    const query = 'SELECT mellcoin_amount FROM general_info WHERE username = ?';
    connection.query(query, [username], (err, results) => {
        if (err) {
            console.error('Ошибка при выполнении запроса: ' + err.stack);
            callback(err, null);
            return;
        }
        if (results.length === 0) {
            callback(new Error('Пользователь не найден'), null);
            return;
        }
        const userBalance = results[0].mellcoin_amount;
        if (userBalance >= bet) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    });
}


function updateBalance(username, amountToChange, connection, callback) {
    // Запрос к базе данных для обновления баланса пользователя
    const updateQuery = 'UPDATE general_info SET mellcoin_amount = mellcoin_amount + ? WHERE username = ?';
    connection.query(updateQuery, [amountToChange, username], (err, results) => {
        if (err) {
            console.error('Ошибка при обновлении баланса: ' + err.stack);
            callback(err);
            return;
        }

        // Проверяем, было ли обновление успешным
        if (results.affectedRows === 0) {
            // Если пользователь не найден, возвращаем ошибку
            const error = new Error('Пользователь не найден');
            callback(error);
            return;
        }
    });
}


function updateBalancesForPVP(winnerUsername, winnerBet, loserUsername, loserBet, connection) {
    // Обновляем баланс победителя
    updateBalance(winnerUsername, winnerBet, connection, (err) => {
        if (err) {
            console.error('Ошибка при обновлении баланса победителя:', err);
            return;
        }
    });

    // Обновляем баланс проигравшего
    updateBalance(loserUsername, -loserBet, connection, (err) => {
        if (err) {
            console.error('Ошибка при обновлении баланса проигравшего:', err);
            return;
        }
    });
}

// rock_paper_scissors !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

// Массив для хранения игроков в очереди
let queue = [];


// Функция для определения победителя
function determineWinner(player1Move, player2Move) {
    if (player1Move === player2Move) {
        return 'Ничья';
    } else if (
        (player1Move === 'rock' && player2Move === 'scissors') ||
        (player1Move === 'scissors' && player2Move === 'paper') ||
        (player1Move === 'paper' && player2Move === 'rock')
    ) {
        return 'Победа Игрока 1!';
    } else {
        return 'Победа Игрока 2!';
    }
}

// Создаем словарь для хранения ходов в каждой комнате
const roomMoves = new Map();

const rockPaperScissors = io.of('/rock_paper_scissors');
rockPaperScissors.on('connection', (socket) => {
    
        // Обработчик события при получении ставки от игрока
    socket.on('player_bet', (data) => {
        let { username, bet } = data;
        socket.username = username;
        socket.bet = bet;

        checkUserBalance(username, bet, (err, hasEnoughCoins) => {
            if (!hasEnoughCoins) {
                // Если у пользователя недостаточно монет, отправляем оповещение на клиент
                socket.emit('not_enough_coins', { error: 'Недостаточно монет для ставки' });
                return;
            }
            // Добавляем игрока в очередь
            queue.push({ username, bet, socketId: socket.id });
            // Отправляем игроку сообщение о добавлении в очередь
            socket.emit('queued');

            // Проверяем, есть ли в очереди игрок с такой же ставкой
            const opponentIndex = queue.findIndex(player => player.bet === bet && player.username !== username);

            if (opponentIndex !== -1) {
                // Найден игрок с той же ставкой, создаем комнату для них
                const opponent = queue[opponentIndex];
                queue.splice(opponentIndex, 1); // Удаляем соперника из очереди
                queue.splice(queue.findIndex(player => player.socketId === socket.id), 1); // Удаляем текущего игрока из очереди

                // Создаем комнату и добавляем в нее обоих игроков
                let roomId = socket.id + '-' + opponent.socketId;

                socket.join(roomId );
                rockPaperScissors.sockets.get(opponent.socketId).join(roomId);

                // Отправляем обоим игрокам сообщение о начале игры
                rockPaperScissors.to(socket.id).emit('game_started', { opponent: { username: opponent.username, bet: opponent.bet }, roomId });
                rockPaperScissors.to(opponent.socketId).emit('game_started', { opponent: { username: socket.username, bet: bet }, roomId });
                // Добавляем комнату в roomMoves
                roomMoves.set(roomId, {});
                // Получаем объект с информацией о комнатах и их участниках
                const rooms = io.sockets.adapter.rooms;
                            
                // Проверяем, существует ли комната и есть ли в ней игроки
                if (rooms.has(roomId)) {
                    const roomInfo = rooms.get(roomId);
                    const numPlayers = roomInfo.size;
                } 

            }

                // Устанавливаем обработчик события хода игрока внутри комнаты
                // Устанавливаем обработчик события хода игрока внутри комнаты
                socket.on('player_move', (move) => {
    
                
                    // Получаем уникальный идентификатор комнаты, в которой находится игрок
                    const room = Array.from(socket.rooms)[1];
                    
                    
                    // Проверяем, существует ли комната и есть ли в ней объект для хранения ходов
                    if (roomMoves.has(room)) {
                        // Обновляем объект ходов для текущей комнаты
                        const moves = roomMoves.get(room);
                        moves[socket.id] = move;
                    
                        // Проверяем, сделали ли оба игрока ход
                        if (Object.values(moves).every(move => move !== null)) {
                            // Проверяем, сделали ли оба игрока ход
                            // Проверяем, сделали ли оба игрока ход
                            if (Object.keys(moves).length === 2) {
                                const playerMoves = Object.entries(moves);
                                const [player1Id, player1Move] = playerMoves[0];
                                const [player2Id, player2Move] = playerMoves[1];
                                

                                } 

                            if (Object.keys(moves).length === 2) {
                                const playerMoves = Object.entries(moves);
                                const [player1Id, player1Move] = playerMoves[0];
                                const [player2Id, player2Move] = playerMoves[1];

                                // Выполняем проверку на победителя
                                const winner = determineWinner(player1Move, player2Move);

                                // Отправляем игрокам информацию о ходе противника и результате игры
                                if (winner === 'Ничья') {
                                    // Если ничья, отправляем обоим игрокам информацию о ничьей
                                    rockPaperScissors.to(player1Id).emit('opponent_move', { move: player2Move, result: 'Ничья' });
                                    rockPaperScissors.to(player2Id).emit('opponent_move', { move: player1Move, result: 'Ничья' });
                                } else {
                                    // Определяем победителя и проигравшего
                                    let winnerId, loserId;
                                    if (winner === 'Победа Игрока 1!') {
                                        winnerId = player1Id;
                                        loserId = player2Id;
                                    } else {
                                        winnerId = player2Id;
                                        loserId = player1Id;
                                    }
                                    
                                    const winnerUsername = rockPaperScissors.sockets.get(winnerId).username; // Получаем имя победителя из объекта сокета
                                    const loserUsername = rockPaperScissors.sockets.get(loserId).username;
                                    let winnerBet = socket.bet; // преобразуем значение ставки в число
                                    let loserBet = socket.bet; // преобразуем значение ставки в число

                                    // Отправляем победителю информацию о его победе
                                    rockPaperScissors.to(winnerId).emit('opponent_move', { move: moves[loserId], result: 'Победа' });
                                
                                    // Отправляем проигравшему информацию о его поражении и имени победителя
                                    rockPaperScissors.to(loserId).emit('opponent_move', { move: moves[winnerId], result: 'Поражение', winner: winnerUsername });

                                    updateBalancesForPVP(winnerUsername, winnerBet, loserUsername, loserBet, connection);
                                    winnerBet = null;
                                    loserBet = null;
                                    socket.bet = null;
                                    
    
                                    roomMoves.delete(room);
                                    // Очищаем ходы в текущей комнате
                                // Очищаем ходы и количество ставки в текущей комнате
                                // Перебираем все элементы массива playerMoves
                                
                                
                                

                            }};

                        } 
                    }
                });
                
            });
           
        

        // Обработчик события отключения клиента от сервера
        // Обработчик события отключения клиента от сервера
        socket.on('disconnect', () => {

            const playerIndex = queue.findIndex(player => player.socketId === socket.id);
            if (playerIndex !== -1) {
                queue.splice(playerIndex, 1);
            }
        });

    });
});



// guess_number !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

// Функция для генерации случайного числа в заданном диапазоне
function generateRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

let secretNumber; // Переменная для хранения секретного числа

// Обработчик подключения клиента к серверу
io.on('connection', (socket) => {
    console.log('Клиент подключился');

    // Обработчик события 'play' от клиента
    socket.on('play', (data) => {
        let { username, bet } = data;
        socket.username = username;
        socket.bet = bet;
        console.log("Принят запрос с выбранной ставкой:" ,socket.bet);

        // Генерируем случайное число от 1 до 100 и сохраняем его
        secretNumber = generateRandomNumber(1, 100);
        console.log("Сгенерированное секретное число:", secretNumber);

        // Отправляем сообщение о начале игры клиенту
        socket.emit('gameStart', { message: 'Начало игры' });

            // Обработчик события 'guess' от клиента
            socket.on('guess', (data) => {
                
                const guessedNumber = parseInt(data.number);
                console.log("Принято число от клиента:", guessedNumber);

                // Сравниваем угаданное число с загаданным
                if (guessedNumber === secretNumber) {
                    // Отправляем клиенту сообщение о выигрыше
                    socket.emit('win', { message: 'Вы угадали число!', secretNumber: secretNumber });

                    // Начисляем монеты пользователю на количество ставки
                    updateBalance(socket.username, socket.bet,connection, (err) => {
                        if (err) {
                            console.error('Ошибка при начислении монет: ' + err.message);
                            return;
                        }
                        console.log('Монеты начислены пользователю:', socket.username);
                    });
                }else {
                    // Отправляем клиенту сообщение о проигрыше
                    socket.emit('lose', { message: 'Вы не угадали число!', secretNumber: secretNumber });

                    // Уменьшаем монеты пользователю на количество ставки
                    updateBalance(socket.username, -socket.bet,connection, (err) => {
                        if (err) {
                            console.error('Ошибка при уменьшении монет: ' + err.message);
                           return;
                      }
                       console.log('Монеты уменьшены пользователю:', socket.username);
                    });
                }
                socket.bet = null;

        });
    });
});









// слоты    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!11!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

// Переменные для хранения предпоследних изображений с каждого слота
let prevImagesSlot1 = [];
let prevImagesSlot2 = [];
let prevImagesSlot3 = [];

// Обработчик POST запроса на маршрут '/spinImages'
app.post('/spinImages', (req, res) => {
    const numImages = Math.floor(Math.random() * 4) + 42; // Генерируем случайное количество изображений (от 30 до 35)
    const images = [];
    for (let i = 0; i < 3; i++) { // Создаем данные для трех слотов
        const slotImages = [];
        for (let j = 0; j < numImages; j++) {
            slotImages.push(getRandomImagePath()); // Генерируем пути к изображениям и добавляем их в массив слота
        }
        images.push(slotImages); // Добавляем массив изображений слота в общий массив
        
        // Сохраняем предпоследнее изображение текущего слота
        if (i === 0) {
            prevImagesSlot1 = slotImages.slice(-2, -1);
        } else if (i === 1) {
            prevImagesSlot2 = slotImages.slice(-2, -1);
        } else if (i === 2) {
            prevImagesSlot3 = slotImages.slice(-2, -1);
        }
    }
    res.json(images); // Отправляем массив с путями к изображениям обратно на клиент
});
// Функция для генерации случайного пути к изображению
function getRandomImagePath() {
    const fruitImages = ['public/images/banana.png', 'public/images/bomb.png', 'public/images/cherry.png', 'public/images/watermelon.png'];
    return fruitImages[Math.floor(Math.random() * fruitImages.length)];
}





// Обработчик GET-запроса для получения информации о пользователе !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1111
// Обработчик GET-запроса для получения информации о пользователе
app.get('/user-info', (req, res) => {
    // Получаем информацию о пользователе из базы данных по токену
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, 'secret_key');
    const username = decoded.username;

    // Запрос к базе данных для получения информации о пользователе
    connection.query('SELECT * FROM general_info WHERE username = ?', [username], (err, results) => {
        if (err) {
            console.error('Ошибка при выполнении запроса: ' + err.stack);
            res.status(500).send('Ошибка сервера');
            return;
        }

        // Проверяем, найден ли пользователь
        if (results.length === 0) {
            res.status(401).send('Пользователь не найден');
            return;
        }

        // Получаем количество монет из результата запроса к базе данных
        const coins = results[0].mellcoin_amount;

        // Формируем объект с информацией о пользователе
        const userInfo = {
            username: username,
            coins: coins
        };

        // Отправляем информацию о пользователе клиенту
        res.json(userInfo);
    });
});



const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
