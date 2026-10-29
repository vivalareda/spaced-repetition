### MCP server for Spaced Repetition

This is an MCP server for [Remembr](https://remembr.reda.sh). It covers the
whole workflow of the web app (reviewing due cards, browsing and managing decks
and cards, creating cards), so an assistant can drive it conversationally.

To configure the server, generate your API key in the settings of the [Remembr](https://remembr.reda.sh) app.

Then, add the following to your `~/.remembr/config.json` file:

```json
{
 "flashcard-test": {
  "command": "npx",
  "args": [
    "mcp-remote",
    "http://remembr.reda.sh/mcp",
    "--allow-http",
    "--header",
    "Authorization: Bearer ${REMEMBR_API_KEY}"
  ],
  "env": {
    "REMEMBR_API_KEY": ""
    }
  }
}
```

Any MCP client that speaks Streamable HTTP can also connect to `/mcp` directly
with an `Authorization: Bearer <api key>` header.

[Demo](./assets/demo.gif)

## Reviewing conversationally

A review session works like the web app's:

1. `get_next_card` returns the next card's question (never its answer). If no
   session is in progress, it starts one over every card due now, most
   overdue first. Use `start_review` instead to review a whole deck.
2. The assistant asks the question and waits for the user's answer.
3. `reveal_answer` returns the answer (and the correct option of a
   multiple-choice card) to compare with, plus the next interval each rating
   would give.
4. `rate_card` records `again`, `hard`, `medium` (or `good`) or `easy`, and
   reschedules the card with the same algorithm as the web app's buttons
   (`easy` gives the longest interval). An `again` card comes back once at the
   end of the session. It returns the next card's question, so the assistant
   can carry on.

The session is stored per user on the backend, so it survives reconnections.
It is separate from a review running in the web app's browser tab; both
reschedule cards the same way.

## Tools

Cards and decks are referred to by the ids returned by other tools. Decks can
also be referred to by name, ignoring case.

| Tool | What it does |
| --- | --- |
| `get_study_overview` | Cards due now (count and first ones), totals, next due date, review session progress |
| `list_due_cards` | Cards due now, optionally of one deck (questions only) |
| `start_review` | Start a session over due cards, or over a whole deck; returns the first question |
| `get_next_card` | Current card's question; starts a due-cards session if none is in progress |
| `reveal_answer` | A card's answer, correct option, images and rating previews |
| `rate_card` | Rate a card (`again`/`hard`/`medium`/`good`/`easy`) and get the next question |
| `list_decks` | Decks with description, card count and due count, plus cards without a deck |
| `create_deck` | Create a deck |
| `update_deck` | Rename a deck or change its description |
| `delete_deck` | Delete a deck and all its cards (requires `confirm: true`) |
| `list_cards` | All cards, those of a deck, or those without a deck |
| `get_card` | Everything about a card, including its answer and schedule |
| `create_flashcard` | Create a question/answer card |
| `create_mcq_flashcard` | Create a multiple-choice card |
| `create_code_flashcard` | Create a card with a code snippet |
| `create_image_flashcard` | Create a card with images (PNG/JPEG/WebP, up to 5 MB), given as public https URLs or base64 data |
| `update_card` | Edit a card's text, code, options or tags |
| `move_card` | Move a card to a deck, or out of any deck |
| `delete_card` | Delete a card (requires `confirm: true`) |

## Web app actions and their tools

| Web app action | Tool |
| --- | --- |
| Home: due-today count, total cards, deck count | `get_study_overview` |
| Home: review queue ("next up" due cards) | `get_study_overview`, `list_due_cards` |
| Start review (due cards) | `get_next_card` or `start_review` |
| Review by deck / dashboard "Review deck" | `start_review` with `deck` |
| Review: show question | `get_next_card` |
| Review: reveal answer / pick an MCQ option | `reveal_answer` |
| Review: rating buttons with interval previews | `reveal_answer` (previews), `rate_card` |
| Review: session summary | `rate_card` (its `session` has `status: "finished"`), `get_study_overview` (`reviewSession`) |
| Dashboard: stats | `get_study_overview`, `list_decks` |
| Dashboard: decks with card counts | `list_decks` |
| Dashboard: view a deck's cards | `list_cards` with `deck` |
| Dashboard: cards without a deck | `list_cards` with `withoutDeck` |
| Dashboard: move a card to a deck | `move_card` |
| Dashboard: delete a card / deck | `delete_card` / `delete_deck` |
| Create deck | `create_deck` |
| Create text / MCQ / code / image card | `create_flashcard` / `create_mcq_flashcard` / `create_code_flashcard` / `create_image_flashcard` |
| Settings: create / delete API key | None: the key is what authenticates the MCP server, so it is managed in the web app |
| Sign in / sign up | None: handled by the web app |

`update_card`, `update_deck` and moving a card out of its deck have no web
app equivalent yet.
