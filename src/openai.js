import {Configuration, OpenAIApi} from 'openai'
import config from 'config'
import {createReadStream} from 'fs'

class OpenAI {
  roles = {
    ASSISTANT: 'assistant',
    USER: 'user',
    SYSTEM: 'system'
  }

  gptVersions = {
    3: 'gpt-3.5-turbo',
    4: 'gpt-4'
  }

  constructor(apiKey) {
    const configuration = new Configuration({
      apiKey
    })
    this.openai = new OpenAIApi(configuration)
  }

  async chat(messages, gptVersion = 3) {
    try {
      const response = await this.openai.createChatCompletion({
        model: this.gptVersions[gptVersion],
        messages
      })

      return response.data.choices[0].message
    } catch (error) {
      console.error('OpenAI.chat error : ', error.message)
    }
  }

  async transcription(filepath) {
    try {
      const response = await this.openai.createTranscription(
        createReadStream(filepath),
        'whisper-1'
      )

      return response.data.text
    } catch (error) {
      console.error('OpenAI.transcription error : ', error.message)
    }
  }
}

export const openai = new OpenAI(config.get('OPENAI_KEY'))