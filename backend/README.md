План разработки backend на Next.js + PostgreSQL
Этап 1: Базовая настройка (2-3 дня)

Настройка Next.js API Routes
Установка Prisma ORM + PostgreSQL
Создание схемы БД (Game, Move, Player)
Настройка Socket.IO сервера (custom server или отдельный процесс)

Этап 2: API endpoints (3-4 дня)

POST /api/games — создание игры
GET /api/games/[id] — получение состояния игры
POST /api/games/[id]/join — подключение к игре
PATCH /api/games/[id] — обновление состояния

Этап 3: WebSocket интеграция (3-4 дня)

Настройка Socket.IO с Next.js (custom server)
События: join-game, make-move, spectate
Разделение ролей через socket middleware
Broadcast обновлений в комнату

Этап 4: Логика игры с БД (4-5 дней)

Сохранение ходов в PostgreSQL через Prisma
Валидация ходов на сервере
Синхронизация: БД ↔ WebSocket ↔ Клиенты
Загрузка игры при переподключении

Этап 5: Управление состоянием (3-4 дня)

Обработка disconnect/reconnect
Восстановление позиции игрока по userId
Список активных наблюдателей
Завершение игры и сохранение результата

Этап 6: Тестирование и деплой (2-3 дня)

Тестирование на разных устройствах
Vercel для Next.js + Supabase/Neon для PostgreSQL
Environment variables для production

-- зделать конвертацию boardToFen && fenToBoard
-- зделать FEN в БД
