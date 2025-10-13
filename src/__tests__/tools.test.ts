import { Tools } from '../tools'

describe('Tools', () => {
  let tools: Tools

  beforeEach(() => {
    tools = new Tools()
  })

  it('should add and execute a tool', async () => {
    function doubleNumber(x: number) { return x * 2 }
    
    tools.add(doubleNumber, 'Doubles a number', {
      x: { type: 'number', description: 'Number to double', required: true }
    })

    const result = await tools.execute('doubleNumber', { x: 5 })
    
    expect(result).toBe(10)
  })

  it('should generate OpenAI schema', () => {
    const weatherFn = (location: string) => `Weather in ${location}`
    
    tools.add(weatherFn, 'Get weather', {
      location: { type: 'string', description: 'City name', required: true }
    })

    const schemas = tools.getSchemas()
    
    expect(schemas).toHaveLength(1)
    expect(schemas[0]).toMatchObject({
      type: 'function',
      function: {
        name: 'weatherFn',
        description: 'Get weather',
        parameters: {
          type: 'object',
          properties: {
            location: { type: 'string', description: 'City name' }
          },
          required: ['location']
        }
      }
    })
  })

  it('should throw error for non-existent tool', async () => {
    await expect(
      tools.execute('nonExistent', {})
    ).rejects.toThrow('Tool nonExistent not found')
  })
})
