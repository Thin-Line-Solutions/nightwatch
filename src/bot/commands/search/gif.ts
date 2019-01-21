import { Message, MessageEmbed } from 'discord.js'
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando'
import axios from 'axios'
import { Config } from '../../../common'
import * as BluebirdPromise from 'bluebird'

const config: Config = require('../../../../config/config.json')

export default class GifCommand extends Command {
  constructor (client: CommandoClient) {
    super(client, {
      name: 'gif',
      group: 'search',
      memberName: 'gif',
      description: 'Express yourself with a gif.',
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'search',
          prompt: 'What gif would you like to search for?\n',
          type: 'string'
        }
      ],
      hidden: !config.optional.steamWebApiKey || !config.optional.steamWebApiKey.trim()
    })
  }

  public async run (msg: CommandoMessage): Promise<Message | Message[]> {
    const search = msg.argString

    if (!search.trim()) {
      return msg.reply('You must enter a search term or phrase.')
    }

    return BluebirdPromise.resolve(axios.get(`http://api.giphy.com/v1/gifs/random?api_key=${config.optional.giphyApiKey}&tag=${encodeURIComponent(search)}`))
      .then(response => {
        if (!response.data.data.image_url) {
          return msg.channel.send('Nothing found!')
        }

        const embed = new MessageEmbed()
          .setImage(`${response.data.data.image_url}`)
          .setAuthor(`${msg.author.tag}`, msg.author.displayAvatarURL())
          .setColor('#0066CC')

        msg.channel.send({ embed })

        return msg.reply(msg.argString)
      })
      .catch(_ => {
        return msg.reply('An error occurred while searching for gifs.')
      })
  }
}
