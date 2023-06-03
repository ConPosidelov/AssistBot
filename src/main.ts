import { Telegraf, session } from 'telegraf'
import express, { ErrorRequestHandler } from 'express'
import config from 'config'
import * as dotenv from 'dotenv'
import { message } from 'telegraf/filters'
import { code } from 'telegraf/format'
import { appRouter, app } from './router/appRouter.js'
import { ogg } from './ogg.js'
import { removeFile } from './utils.js'
import { openai } from './openai.js'
import { initCommand, processTextToChat, INITIAL_SESSION } from './logic.js'

dotenv.config()

function runBot() {
  // const TELEGRAM_TOKEN: string = config.get('TELEGRAM_TOKEN')
  const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN as string;
  // console.log('TELEGRAM_TOKEN', TELEGRAM_TOKEN)
  console.log(config.get('TEST_ENV'))

  const bot = new Telegraf(TELEGRAM_TOKEN)
  bot.use(session())
  bot.command('new', initCommand)
  bot.command('start', initCommand)
  bot.on(message('voice'), async (ctx) => {
    // если сессия не определилась, создаем новую
    // @ts-ignore
    ctx.session ??= INITIAL_SESSION
    try {
      await ctx.reply(code('Сообщение принял. Жду ответ от сервера...'))
      const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
      const userId = String(ctx.message.from.id)
      const oggPath = await ogg.create(link.href, userId)
      const mp3Path = await ogg.toMp3(oggPath, userId)

      removeFile(oggPath)
      const text = await openai.transcription(mp3Path)
      console.log('openai.transcription', text)

      await ctx.reply(code(`Ваш запрос: ${text}`))
      await processTextToChat(ctx, text)
    } catch (e) {
      // @ts-ignore
      console.log(`Error while voice message`, e.message)
    }
  })

  bot.launch()
  process.once('SIGINT', () => bot.stop('SIGINT'))
  process.once('SIGTERM', () => bot.stop('SIGTERM'))
}

function runServer() {
  const port = process.env.PORT || 3000
  const server = express()

  const errorHandler: ErrorRequestHandler = (err, _, res, __) => {
    console.log(`Error while ErrorRequestHandler`, err)
    res.status(500).json({ message: err.message || 'Something went wrong, check logs' })
  }
  server.use(express.json())
  server.use('/app', appRouter)
  server.use(errorHandler)
  server.listen(port, () => console.log(`Server has been started on port ${port}`))
}

;(async () => {
  try {
    await runServer()
    await runBot()
  } catch (e) {
    console.error({ e })
    process.exit(1)
  } finally {
    // prisma.$disconnect()
  }
})()
