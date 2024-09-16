import { useState, useCallback } from "react"

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:3001"

export interface UseChatGPTReturn {
  output: string
  isLoading: boolean
  error: string | null
  streamResponse: (prompt: string, image?: File) => Promise<void>
  reset: () => void
}

export const useChatGPT = (): UseChatGPTReturn => {
  const [output, setOutput] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const streamResponse = useCallback(
    async (prompt: string, image?: File): Promise<void> => {
      setIsLoading(true)
      setOutput("")
      setError(null)

      const formData = new FormData()
      formData.append("prompt", prompt)
      if (image) {
        formData.append("image", image)
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/chatgpt-stream`, {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const reader = response.body?.getReader()
        if (!reader) {
          throw new Error("ReadableStream not supported.")
        }

        const decoder = new TextDecoder()

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-constant-condition
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value)
          setOutput((prevOutput) => prevOutput + chunk)
        }
      } catch (error) {
        console.error("Error in ChatGPT API call:", error)
        setError("Error occurred while streaming the response.")
        setOutput("An error occurred. Please try again.")
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const reset = useCallback(() => {
    setOutput("")
    setIsLoading(false)
    setError(null)
  }, [])

  return {
    output,
    isLoading,
    error,
    streamResponse,
    reset,
  }
}
