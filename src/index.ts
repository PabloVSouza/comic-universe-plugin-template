class ExampleRepoPlugin implements IRepoPluginRepository {
  public RepoName = 'Example Repo Plugin'
  public RepoTag = 'example'
  public RepoUrl = 'https://example.com/'

  constructor(data: IRepoPluginRepositoryInit) {}

  public methods: IRepoPluginMethods = {
    getList: async (): Promise<IComic[]> => {
      return new Promise((resolve) => {
        resolve([])
      })
    },

    search: async ({ search }): Promise<IComic[]> => {
      return new Promise((resolve) => {
        resolve([])
      })
    },

    getDetails: async (search): Promise<Partial<IComic>> => {
      return new Promise((resolve) => {
        resolve({})
      })
    },

    getChapters: async ({ siteId }): Promise<IChapter[]> => {
      return new Promise((resolve) => {
        resolve([])
      })
    },

    getPages: async ({ siteLink }): Promise<IPage[]> => {
      return new Promise((resolve) => {
        resolve([])
      })
    }
  }
}

export default ExampleRepoPlugin
