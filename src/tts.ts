import {
  LlamaContext,
  initVocoder,
  getFormattedAudioCompletion,
  decodeAudioTokens,
  releaseVocoder,
  getTTSType,
  isVocoderEnabled,
} from './index'
import type { NativeAudioDecodeResult, NativeTTSType } from './index'

export interface TTSOptions {
  voiceId?: string
  speed?: number
  pitch?: number
  volume?: number
  format?: 'wav' | 'mp3' | 'ogg'
  sampleRate?: number
}

export interface TTSGenerationResult extends NativeAudioDecodeResult {
  metadata?: {
    duration?: number
    sampleRate?: number
    channels?: number
    format?: string
  }
}

export interface TTSSpeaker {
  id: string
  name?: string
  language?: string
  gender?: 'male' | 'female' | 'neutral'
  config: Record<string, any>
}

export class TTSError extends Error {
  constructor(
    message: string,
    public code?: string,
    public contextId?: number
  ) {
    super(message)
    this.name = 'TTSError'
  }
}

export class CactusTTS {
  private context: LlamaContext
  private isInitialized: boolean = false
  private isReleased: boolean = false
  private vocoderPath?: string
  private ttsType?: NativeTTSType

  private constructor(context: LlamaContext, vocoderPath: string) {
    this.context = context
    this.vocoderPath = vocoderPath
  }

  static async init(
    context: LlamaContext,
    vocoderModelPath: string,
  ): Promise<CactusTTS> {
    if (!context) {
      throw new TTSError('LlamaContext is required', 'INVALID_CONTEXT')
    }
    
    if (!vocoderModelPath || typeof vocoderModelPath !== 'string') {
      throw new TTSError('Valid vocoder model path is required', 'INVALID_VOCODER_PATH')
    }

    try {
      await initVocoder(context.id, vocoderModelPath)
      const instance = new CactusTTS(context, vocoderModelPath)
      instance.isInitialized = true
      instance.ttsType = await getTTSType(context.id)
      return instance
    } catch (error) {
      throw new TTSError(
        `Failed to initialize TTS: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'INITIALIZATION_FAILED',
        context.id
      )
    }
  }

 
  async generate(
    textToSpeak: string,
    speaker: TTSSpeaker | string,
    options?: TTSOptions
  ): Promise<TTSGenerationResult> {
    this.validateState()
    this.validateInputs(textToSpeak, speaker)

    const speakerConfig = typeof speaker === 'string' ? speaker : JSON.stringify(speaker.config)
    const startTime = Date.now()

    try {
      const { formatted_prompt } = await getFormattedAudioCompletion(
        this.context.id,
        speakerConfig,
        textToSpeak,
      )
      
      if (!formatted_prompt) {
        throw new TTSError('Failed to format audio prompt', 'FORMATTING_FAILED', this.context.id)
      }

      const tokenizeResult = await this.context.tokenize(formatted_prompt)
      if (!tokenizeResult?.tokens || tokenizeResult.tokens.length === 0) {
        throw new TTSError('Failed to tokenize prompt', 'TOKENIZATION_FAILED', this.context.id)
      }

      const audioResult = await decodeAudioTokens(this.context.id, tokenizeResult.tokens)
      const endTime = Date.now()

      return {
        ...audioResult,
        metadata: {
          duration: endTime - startTime,
          sampleRate: options?.sampleRate,
          format: options?.format || 'wav',
          channels: 1, // Assuming mono output
        }
      }
    } catch (error) {
      if (error instanceof TTSError) {
        throw error
      }
      throw new TTSError(
        `Audio generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'GENERATION_FAILED',
        this.context.id
      )
    }
  }

 
  async isVocoderReady(): Promise<boolean> {
    if (!this.isInitialized || this.isReleased) {
      return false
    }
    
    try {
      return await isVocoderEnabled(this.context.id)
    } catch {
      return false
    }
  }


  getTTSType(): NativeTTSType | undefined {
    return this.ttsType
  }

 
  getContextId(): number {
    return this.context.id
  }

  getVocoderPath(): string | undefined {
    return this.vocoderPath
  }


  isReady(): boolean {
    return this.isInitialized && !this.isReleased
  }

  static createSpeaker(
    id: string,
    config: Record<string, any>,
    metadata?: {
      name?: string
      language?: string
      gender?: 'male' | 'female' | 'neutral'
    }
  ): TTSSpeaker {
    return {
      id,
      config,
      ...metadata
    }
  }

 
  private validateState(): void {
    if (this.isReleased) {
      throw new TTSError('TTS instance has been released', 'INSTANCE_RELEASED', this.context.id)
    }
    
    if (!this.isInitialized) {
      throw new TTSError('TTS instance not initialized', 'NOT_INITIALIZED', this.context.id)
    }
  }

  
  private validateInputs(textToSpeak: string, speaker: TTSSpeaker | string): void {
    if (!textToSpeak || typeof textToSpeak !== 'string' || textToSpeak.trim().length === 0) {
      throw new TTSError('Valid text input is required', 'INVALID_TEXT_INPUT')
    }

    if (textToSpeak.length > 10000) { // Reasonable limit
      throw new TTSError('Text input too long (max 10000 characters)', 'TEXT_TOO_LONG')
    }

    if (!speaker) {
      throw new TTSError('Speaker configuration is required', 'INVALID_SPEAKER')
    }

    if (typeof speaker === 'object' && (!speaker.id || !speaker.config)) {
      throw new TTSError('Speaker must have id and config properties', 'INVALID_SPEAKER_FORMAT')
    }
  }

  
  async release(): Promise<void> {
    if (this.isReleased) {
      return // Already released, no-op
    }

    try {
      await releaseVocoder(this.context.id)
      this.isReleased = true
      this.isInitialized = false
    } catch (error) {
      throw new TTSError(
        `Failed to release TTS resources: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'RELEASE_FAILED',
        this.context.id
      )
    }
  }
} 