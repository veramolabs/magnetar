import { IAgent, IMessageHandler, TAgent } from '@veramo/core'
import { text, Request, Router } from 'express'

interface RequestWithMessageHandler extends Request {
  agent?: TAgent<IMessageHandler>
}

/**
 * @public
 */
export interface MessagingRouterOptions {
  /**
   * Message metadata
   */
  metaData: {
    type: string
    value?: string
  }
}

/**
 * Creates a router for handling incoming messages
 *
 * @param options - Initialization option
 * @returns Expressjs router
 */
export const MessagingRouter = (options: MessagingRouterOptions): Router => {
  const router = Router()
  router.use(text({ type: '*/*' }))
  router.post('/', async (req: RequestWithMessageHandler, res) => {
    try {
      const message = await req.agent?.handleMessage({
        raw: (req.body as any) as string,
        metaData: [options.metaData],
        save: true,
      })

      const didMethod = message?.from?.split(':')[1]
      if (message && didMethod === 'nft') {
        console.log('Received message', message.type, message.id)
        res.json({ id: message.id })
      } else {
        throw Error('Invalid did method: ' + didMethod)
      }
    } catch (e) {
      console.log(e)
      res.status(404).send(e.message)
    }
  })

  return router
}
