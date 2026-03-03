export interface User {
  id: string
  username: string
}

export interface Session {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  messageCount: number
  preview: string
  messages: Message[]
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  isStreaming?: boolean
}

export interface StreamChunk {
  text: string
  done: boolean
}

export interface AuthState {
  isAuthenticated: boolean
  username: string
}
