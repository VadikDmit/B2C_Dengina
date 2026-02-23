# Задача для B2C фронтенда: ИИ-ассистент в Личном Кабинете

## Суть

На бэке реализован ИИ-ассистент, который **знает контекст каждого этапа** и **данные клиента** (цели, доход, риск-профиль, финплан). Нужно встроить чат-виджет в каждую страницу ЛК. ИИ сам понимает, на каком этапе клиент, и подсказывает именно то, что нужно.

---

## API (все запросы с Bearer Token)

### 1. Отправить сообщение (обычный ответ)

```
POST /my/ai-b2c/chat
Content-Type: application/json
Authorization: Bearer <token>
```

**Тело запроса:**
```json
{
  "stage": "AI_B2C_site",
  "message": "Пользователь нажал кнопку X. Данные: { price: 100, goal: 'car' }. Вопрос пользователя: А как мне купить машину быстрее?"
}
```

> В `message` фронт может слать любую строку. Это может быть как просто вопрос клиента, так и склеенная строка: "Данные страницы: [JSON] + Вопрос: [Текст]". Бэк всё это передаст в ИИ.

---

### 2. Отправить сообщение (стриминг — рекомендуется)

```
POST /my/ai-b2c/chat/stream
Content-Type: application/json
Authorization: Bearer <token>
```

**Тело запроса** — такое же:
```json
{
  "stage": "chooseTarget",
  "message": "Какую цель мне выбрать?"
}
```

**Ответ** — Server-Sent Events (SSE). Текст приходит по частям:
```
data: {"choices":[{"delta":{"content":"Для"}}]}
data: {"choices":[{"delta":{"content":" начала"}}]}
data: {"choices":[{"delta":{"content":" давайте"}}]}
...
data: [DONE]
```

#### Пример кода для фронта (fetch + ReadableStream):

```javascript
async function sendStreamingMessage(stage, message, onChunk, onDone) {
  const response = await fetch('/api/v1/my/ai-b2c/chat/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ stage, message })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

    for (const line of lines) {
      const data = line.replace('data: ', '');
      if (data === '[DONE]') {
        onDone(fullText);
        return;
      }
      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content || '';
        fullText += content;
        onChunk(fullText);  // Обновляем UI посимвольно
      } catch (e) { /* skip */ }
    }
  }
}
```

#### Использование:
```javascript
sendStreamingMessage(
  'chooseTarget',
  'Какие цели мне выбрать?',
  (partialText) => { chatBubble.innerHTML = renderMarkdown(partialText); },
  (fullText) => { console.log('Готово:', fullText); }
);
```

---

### 3. Получить историю чата

```
GET /my/ai-b2c/history?stage=chooseTarget
Authorization: Bearer <token>
```

**Ответ:**
```json
[
  { "id": 1, "stage_key": "chooseTarget", "role": "user", "content": "Привет!", "created_at": "..." },
  { "id": 2, "stage_key": "chooseTarget", "role": "assistant", "content": "Привет! Я помогу...", "created_at": "..." }
]
```

> Без параметра `stage` — вернёт всю историю по всем этапам.

---

### 4. Очистить историю

```
DELETE /my/ai-b2c/history?stage=chooseTarget
Authorization: Bearer <token>
```

> Без параметра `stage` — очистит всю историю.

---

## Значения `stage` по страницам

| Страница | `stage` |
|----------|---------|
| Главная / Начало | `PFP1` |
| Выбор целей | `chooseTarget` |
| Риск-профилирование | `riskProfile` |
| Финансовый резерв | `financialReserve` |
| Активы и пассивы | `assets` |
| Результат / Финплан | `result` |

> [!IMPORTANT]
> При переходе на другую страницу — менять `stage` в запросах. У каждого этапа **своя история** и **свой контекст**.

---

## UX-рекомендации

### Чат-виджет
- **Плавающая кнопка** (FAB) в правом нижнем углу с иконкой ИИ/аватарки
- Клик → открывается чат-панель (слайд снизу или сбоку)
- Внутри: история сообщений + поле ввода

### Отображение сообщений
- **user** — справа, как в мессенджере
- **assistant** — слева, с аватаркой ИИ
- Ответ ИИ в **Markdown** → рендерить через `react-markdown` или аналог
- При стриминге — текст появляется **посимвольно** (плавный эффект печати)

### Начальное сообщение
- При открытии чата на этапе, если истории нет — показать приветственное сообщение:
  - `chooseTarget`: *"Привет! Я помогу выбрать финансовые цели. Что для тебя сейчас важнее всего?"*
  - `riskProfile`: *"Давай определим твой риск-профиль! Готов ответить на пару вопросов?"*
  - `result`: *"Финплан готов! Задавай любые вопросы по результатам."*

### Загрузка истории
- При открытии чата — `GET /my/ai-b2c/history?stage=...`
- Показать предыдущие сообщения (скролл вверх)

### Индикатор "печатает..."
- Во время стриминга показывать анимацию "ИИ печатает..."
- После `[DONE]` — убрать индикатор
