import { RequestHandler } from 'express'

class App {
  constructor() {}

  test: RequestHandler = async (_, res) => {
    res.status(200)
    res.json({ message: 'Test started' })
  }
}

export default App
