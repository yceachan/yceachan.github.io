import 'vitepress'

declare module 'vitepress' {
  export namespace DefaultTheme {
    interface Config {
      profile?: {
        photo?: string
        name?: string
        bio?: string
        mail?: string
        github?: string
        repo?: string
        friends?: string[]
      }
    }
  }
}

export {}