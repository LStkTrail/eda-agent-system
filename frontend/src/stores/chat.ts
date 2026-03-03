import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Session, Message } from '@/types'
import { mockSessions } from '@/mock/sessions'
import { matchResponse } from '@/mock/responses'

export const useChatStore = defineStore('chat', () => {
  const sessions = ref<Session[]>([...mockSessions])
  const activeSessionId = ref<string | null>(null)
  const isStreaming = ref(false)
  let streamTimer: ReturnType<typeof setTimeout> | null = null

  const activeSession = computed(() =>
    sessions.value.find(s => s.id === activeSessionId.value) || null
  )

  const messages = computed(() => activeSession.value?.messages || [])

  const sortedSessions = computed(() =>
    [...sessions.value].sort((a, b) => b.updatedAt - a.updatedAt)
  )

  function createNewSession() {
    cancelStream()
    const id = 'session-' + Date.now()
    const newSession: Session = {
      id,
      title: '新对话',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messageCount: 0,
      preview: '',
      messages: [],
    }
    sessions.value.unshift(newSession)
    activeSessionId.value = id
  }

  function selectSession(id: string) {
    if (id === activeSessionId.value) return
    cancelStream()
    activeSessionId.value = id
  }

  function deleteSession(id: string) {
    if (id === activeSessionId.value) {
      cancelStream()
    }
    sessions.value = sessions.value.filter(s => s.id !== id)
    if (activeSessionId.value === id) {
      activeSessionId.value = sessions.value[0]?.id || null
    }
  }

  function sendMessage(content: string) {
    if (!content.trim() || isStreaming.value) return

    // Auto-create session if none active
    if (!activeSessionId.value) {
      createNewSession()
    }

    const session = activeSession.value
    if (!session) return

    // Add user message
    const userMsg: Message = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    }
    session.messages.push(userMsg)

    // Update session metadata
    if (session.messageCount === 0) {
      session.title = content.trim().slice(0, 20) + (content.length > 20 ? '...' : '')
    }
    session.messageCount++
    session.updatedAt = Date.now()
    session.preview = content.trim().slice(0, 50)

    // Create empty assistant message
    const assistantMsg: Message = {
      id: 'msg-' + (Date.now() + 1),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    }
    session.messages.push(assistantMsg)

    // Get the reactive reference (after push, the original ref may not be reactive)
    const reactiveMsg = session.messages[session.messages.length - 1]

    // Start streaming simulation
    simulateStream(content, reactiveMsg, session)
  }

  function simulateStream(prompt: string, msg: Message, session: Session) {
    isStreaming.value = true
    const fullText = matchResponse(prompt)
    let index = 0

    function emitNext() {
      if (index >= fullText.length) {
        msg.isStreaming = false
        isStreaming.value = false
        session.messageCount++
        session.updatedAt = Date.now()
        session.preview = fullText.slice(0, 50) + '...'
        streamTimer = null
        return
      }

      // Determine chunk size: 1 char for CJK, 1-3 for others
      const char = fullText[index]
      const isCJK = /[\u4e00-\u9fff\u3000-\u303f]/.test(char)
      let chunkSize = isCJK ? 1 : Math.min(Math.floor(Math.random() * 3) + 1, fullText.length - index)

      // Speed up inside code blocks
      const isInCode = fullText.lastIndexOf('```', index) > fullText.lastIndexOf('```', Math.max(0, index - 1)) - 1
      if (isInCode) chunkSize = Math.min(chunkSize + 2, fullText.length - index)

      msg.content += fullText.slice(index, index + chunkSize)
      index += chunkSize

      const delay = 20 + Math.random() * 30
      streamTimer = setTimeout(emitNext, delay)
    }

    streamTimer = setTimeout(emitNext, 300) // initial delay
  }

  function cancelStream() {
    if (streamTimer) {
      clearTimeout(streamTimer)
      streamTimer = null
    }
    if (isStreaming.value) {
      isStreaming.value = false
      const session = activeSession.value
      if (session) {
        const lastMsg = session.messages[session.messages.length - 1]
        if (lastMsg && lastMsg.isStreaming) {
          lastMsg.isStreaming = false
        }
      }
    }
  }

  return {
    sessions,
    activeSessionId,
    isStreaming,
    activeSession,
    messages,
    sortedSessions,
    createNewSession,
    selectSession,
    deleteSession,
    sendMessage,
    cancelStream,
  }
})
