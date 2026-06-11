'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

type Mensaje = {
  id: number
  chat_id: number
  contenido: string
  direccion: 'entrante' | 'saliente'
  created_at: string
}

async function getMensajes(chatId: string): Promise<Mensaje[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/chats/${chatId}/mensajes`
  )

  const data = await response.json()

  if (data.status === 'error') {
    throw new Error(data.message)
  }

  return data.mensajes
}

async function enviarMensaje(chatId: string, contenido: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/chats/${chatId}/mensajes`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contenido }),
    }
  )

  const data = await response.json()

  if (data.status === 'error') {
    throw new Error(data.message)
  }

  return data
}

async function eliminarMensaje(id: number) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/mensajes/${id}`,
    {
      method: 'DELETE',
    }
  )

  const data = await response.json()

  if (data.status === 'error') {
    throw new Error(data.message)
  }

  return data
}

function formatearHora(fecha: string) {
  return new Date(fecha).toLocaleTimeString('es-HN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function ChatPage() {
  const params = useParams()
  const chatId = params.id as string
  const queryClient = useQueryClient()

  const [contenido, setContenido] = useState('')

  const {
    data: mensajes = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['mensajes', chatId],
    queryFn: () => getMensajes(chatId),
  })

  const enviarMutation = useMutation({
    mutationFn: (texto: string) => enviarMensaje(chatId, texto),
    onSuccess: () => {
      setContenido('')
      queryClient.invalidateQueries({
        queryKey: ['mensajes', chatId],
      })
    },
  })

  const eliminarMutation = useMutation({
    mutationFn: (id: number) => eliminarMensaje(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['mensajes', chatId],
      })
    },
  })

  const handleSubmit = () => {
    if (!contenido.trim()) return
    enviarMutation.mutate(contenido.trim())
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-100 p-6 text-black">
        Cargando mensajes...
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-100 p-6 text-red-600">
        Error al cargar mensajes: {(error as Error).message}
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6 text-black">
      <section className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">
          Chat {chatId}
        </h1>

        <div className="space-y-4">
          {mensajes.length === 0 ? (
            <p className="text-gray-500">Aún no hay mensajes</p>
          ) : (
            mensajes.map((mensaje) => (
              <div
                key={mensaje.id}
                className={`max-w-sm rounded-lg p-3 shadow-sm ${
                  mensaje.direccion === 'saliente'
                    ? 'ml-auto bg-green-200'
                    : 'bg-gray-200'
                }`}
              >
                <p className="text-black">{mensaje.contenido}</p>

                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="text-xs text-gray-600">
                    {formatearHora(mensaje.created_at)}
                  </span>

                  <button
                    onClick={() => {
                      const confirmar = confirm(
                        '¿Seguro que deseas eliminar este mensaje?'
                      )

                      if (confirmar) {
                        eliminarMutation.mutate(mensaje.id)
                      }
                    }}
                    className="text-xs text-red-600 hover:underline"
                    disabled={eliminarMutation.isPending}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 flex gap-2">
          <input
            type="text"
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmit()
              }
            }}
            placeholder="Escribe un mensaje..."
            className="flex-1 rounded border p-2 text-black placeholder:text-gray-400"
          />

          <button
            onClick={handleSubmit}
            disabled={enviarMutation.isPending || !contenido.trim()}
            className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          >
            {enviarMutation.isPending ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </section>
    </main>
  )
}