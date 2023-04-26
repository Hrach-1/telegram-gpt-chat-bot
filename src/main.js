import {Telegraf, session} from 'telegraf'
import {message} from 'telegraf/filters'
import {code} from 'telegraf/format'
import config from 'config'
import {ogg} from './ogg.js'
import {openai} from './openai.js'
import {checkIsInArray} from './utils.js'

const INITIAL_SESSION = {
  messages: []
}

const bot = new Telegraf(config.get('TELEGRAM_TOKEN'))

bot.use(session())

bot.command('new', async ctx => {
  try {
    ctx.session = INITIAL_SESSION
    await ctx.reply('Waiting for voice or text message...')
  } catch (error) {
    console.error('New command error : ', error.message)
  }
})

bot.command('start', async ctx => {
  try {
    ctx.session = INITIAL_SESSION
    await ctx.reply('Waiting for voice or text message...')
  } catch(error) {
    console.error('Start command error : ', error.message)
  }
})

bot.on(message('voice'), async ctx => {
  const isAllowedUser = checkIsInArray(config.get('ALLOWED_USERS'), ctx.message.from.username)
  if (!isAllowedUser) return

  ctx.session ??= INITIAL_SESSION

  try {
    await ctx.reply(code('Waiting for server response...'))
    const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
    const userId = String(ctx.message.from.id)
    console.log('message : ', ctx.message)
    console.log(link.href)
    const oggPath = await ogg.create(link.href, userId)
    const mp3Path = await ogg.toMp3(oggPath, userId)

    const text = await openai.transcription(mp3Path)
    await ctx.reply(code('Text : ' + text))

    ctx.session.messages.push({role: openai.roles.USER, content: text})
    const response = await openai.chat(ctx.session.messages)

    ctx.session.messages.push({
      role: openai.roles.ASSISTANT,
      content: response.content
    })

    await ctx.reply(response.content)
  } catch (error) {
    console.error('Voice message error : ', error.message)
  }
})

bot.on(message('text'), async ctx => {
  const isAllowedUser = checkIsInArray(config.get('ALLOWED_USERS'), ctx.message.from.username)
  if (!isAllowedUser) return

  ctx.session ??= INITIAL_SESSION

  try {
    await ctx.reply(code('Waiting for server response...'))
    ctx.session.messages.push({
      role: openai.roles.USER,
      content: ctx.message.text
    })
    const response = await openai.chat(ctx.session.messages)

    ctx.session.messages.push({
      role: openai.roles.ASSISTANT,
      content: response.content
    })

    await ctx.reply(response.content)
  } catch (error) {
    console.error('Voice message error : ', error.message)
  }
})

bot.command('start', async ctx => {
  await ctx.reply(JSON.stringify(ctx.message, null, 2))
})

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))