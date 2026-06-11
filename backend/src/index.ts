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
          message: 'chatId debe ser numerico'
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
        message: 'Error del servidor'
      },
      500
    )
  }
})

app.post('/chats/:chatId/mensajes', async (c) => {
  try {
    const chatId = Number(c.req.param('chatId'))

    if (isNaN(chatId)) {
      return c.json(
        {
          status: 'error',
          message: 'chatId debe ser numerico'
        },
        400
      )
    }

    const body = await c.req.json()
    const contenido = String(body.contenido || '').trim()

    if (!contenido) {
      return c.json(
        {
          status: 'error',
          message: 'El contenido es requerido'
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

    const mensaje = await sql`
      INSERT INTO mensajes (chat_id, contenido, direccion)
      VALUES (${chatId}, ${contenido}, 'saliente')
      RETURNING *
    `

    return c.json({
      status: 'success',
      mensaje: mensaje[0]
    })
  } catch (error) {
    return c.json(
      {
        status: 'error',
        message: 'Error del servidor'
      },
      500
    )
  }
})

export default app