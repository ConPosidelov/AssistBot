import { Configuration, OpenAIApi } from 'openai'
import * as dotenv from 'dotenv'
import config from 'config'
import { createReadStream } from 'fs'

dotenv.config()
const OPENAI_KEY = process.env.OPENAI_KEY
// console.log('OPENAI_KEY', OPENAI_KEY)

class OpenAI {
  roles = {
    ASSISTANT: 'assistant',
    USER: 'user',
    SYSTEM: 'system',
  }
  constructor(apiKey) {
    const configuration = new Configuration({
      apiKey,
    })
    this.openai = new OpenAIApi(configuration)
  }
  async chat(messages) {
    try {
      const response = await this.openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages,
      })
      return response.data.choices[0].message
    } catch (e) {
      console.log('Error while gpt chat', e.message)
    }
  }

  async transcription(filepath) {
    try {
      const response = await this.openai.createTranscription(
        createReadStream(filepath),
        'whisper-1'
      )
      return response.data.text
    } catch (e) {
      console.log('Error while transcription', e.message)
    }
  }
}


export const openai = new OpenAI(OPENAI_KEY)
