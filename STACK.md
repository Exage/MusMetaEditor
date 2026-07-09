# Стек проекта MusMetaEdit

## Назначение

MusMetaEdit - веб-приложение для чтения и редактирования метаданных аудиофайлов. Сейчас проект ориентирован на MP3-файлы, включая работу с обложками треков.

## Основной стек

- Next.js 16.2.4
- React 19.2.4
- React DOM 19.2.4
- TypeScript 5
- Tailwind CSS 4
- PostCSS с `@tailwindcss/postcss`

## Архитектура

- Next.js App Router
- Route groups: `(web)` для страниц и `(api)` для API-роутов
- API routes на базе Next.js Route Handlers
- Клиентские экраны вынесены в `app/screens/`
- Общие API-запросы, типы и утилиты находятся в `app/shared/`
- Alias импортов: `@/*` указывает на корень проекта

## Работа с аудио и метаданными

- `music-metadata` - чтение аудиометаданных
- `node-id3` - запись ID3-метаданных в MP3
- `sharp` - обработка и нормализация изображений обложек
- `jszip` - пакетная обработка и скачивание нескольких файлов

## Поддерживаемые форматы

- Аудио: MP3
- MIME-типы аудио: `audio/mpeg`, `audio/mp3`
- Обложки: JPEG, PNG, WebP
- В будущем планируется добавить поддержку других аудиоформатов

## Ограничения файлов

- Максимальный размер одного аудиофайла: 20 MB
- Максимальный размер обложки: 5 MB
- Максимум аудиофайлов в пакетной обработке: 20
- Максимальный общий размер пакетной загрузки: 200 MB

## UI и стили

- Tailwind CSS 4
- `clsx` - условная сборка CSS-классов
- `tailwind-merge` - безопасное объединение Tailwind-классов

## Качество кода

- ESLint 9
- `eslint-config-next` 16.2.4
- `eslint-config-prettier`
- Prettier 3.8.3
- TypeScript strict mode

## Скрипты

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run format
npm run format:check
```

## Среда выполнения

- Node.js окружение для Next.js
- Серверные утилиты используют Node-only API и должны оставаться вне клиентского bundle
