import { Telegraf, session } from 'telegraf'
import config from 'config'
import { message } from 'telegraf/filters'
import { code } from 'telegraf/format'
import { ogg } from './ogg.js'
import { removeFile } from './utils.js'
import { openai } from './openai.js'
import { initCommand, processTextToChat, INITIAL_SESSION } from './logic.js'

const TELEGRAM_TOKEN: string = config.get('TELEGRAM_TOKEN')

console.log(config.get('TEST_ENV'))

const bot = new Telegraf(TELEGRAM_TOKEN)
bot.use(session())

bot.command('new', initCommand)
bot.command('start', initCommand)

bot.on(message('voice'),async (ctx) => {
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
