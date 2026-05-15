# docker compose -f compose.prod.yml up --build // run a production version

# docker compose -f compose.dev.yml up --build // run a developer version

# docker build -t chess-backend .

# docker-compose run --rm backend sh -c "npx prisma migrate reset"

# docker-compose run --rm backend sh -c "npx prisma migrate dev --name init"

# docker compose -f compose.prod.yml exec backend npx prisma db push // to start db

# npx prisma generate

# npx prisma migrate
