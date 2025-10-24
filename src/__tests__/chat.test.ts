import { ConversationHistoryManager } from '../chat'

describe('ConversationHistoryManager', () => {
  let manager: ConversationHistoryManager

  beforeEach(() => {
    manager = new ConversationHistoryManager()
  })

  it('should start with empty history', () => {
    const messages = manager.getMessages()
    expect(messages).toEqual([])
  })

  it('should track new messages', () => {
    const messages = [{ role: 'user', content: 'Hello' }]
    const { newMessages, requiresReset } = manager.processNewMessages(messages)

    expect(newMessages).toEqual(messages)
    expect(requiresReset).toBe(false)
  })

  it('should detect divergent history', () => {
    manager.update([{ role: 'user', content: 'Hello' }], { role: 'assistant', content: 'Hi' })

    const differentMessages = [{ role: 'user', content: 'Different' }]
    const { newMessages, requiresReset } = manager.processNewMessages(differentMessages)

    expect(requiresReset).toBe(true)
    expect(newMessages).toEqual(differentMessages)
  })

  it('should only return new messages on continuation', () => {
    const msg1 = { role: 'user', content: 'Hello' }
    const msg2 = { role: 'assistant', content: 'Hi' }
    const msg3 = { role: 'user', content: 'How are you?' }

    manager.update([msg1], msg2)
    const { newMessages, requiresReset } = manager.processNewMessages([msg1, msg2, msg3])

    expect(newMessages).toEqual([msg3])
    expect(requiresReset).toBe(false)
  })

  it('should reset history on reset call', () => {
    manager.update([{ role: 'user', content: 'Hello' }], { role: 'assistant', content: 'Hi' })
    manager.reset()

    const messages = manager.getMessages()
    expect(messages).toEqual([])
  })
})
