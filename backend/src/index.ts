import { Hono } from 'hono'
import { neon } from '@neondatabase/serverless'

type Bindings = {
  DATABASE_URL: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('/chats/:chatId/mensajes', async (c) => {
  try {
    const chatId = Number(c.req.param('chatId'))

    if (isNaN(chatId)) {
      return c.json(
        {
          status: 'error',
          message: 'chatId debe ser numérico'
        },
        400
      )
    }

    const sql = neon(c.env.DATABASE_URL)

    const chat = await sql`
      SELECT *
      FROM chats
      WHERE id = ${chatId}
    `

    if (chat.length === 0) {
      return c.json(
        {
          status: 'error',
          message: 'Chat no encontrado'
        },
        404
      )
    }

    const mensajes = await sql`
      SELECT *
      FROM mensajes
      WHERE chat_id = ${chatId}
      ORDER BY created_at ASC
    `

    return c.json({
      status: 'success',
      mensajes
    })
  } catch (error) {
    return c.json(
      {
        status: 'error',
        message: 'Error interno del servidor'
      },
      500
    )
  }
})

export default app