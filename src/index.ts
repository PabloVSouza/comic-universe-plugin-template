class ExampleRepoPlugin implements IRepoPluginRepository {
  public RepoName = 'Example Repo Plugin'
  public RepoTag = 'example'
  public RepoUrl = 'https://example.com/'

  constructor(data: IRepoPluginRepositoryInit) {}

  public methods: IRepoPluginMethods = {
    getList: async (): Promise<ComicInterface[]> => {
      return new Promise((resolve) => {
        resolve([])
      })
    },

    search: async ({ search }): Promise<ComicInterface[]> => {
      return new Promise((resolve) => {
        resolve([])
      })
    },

    getDetails: async (search): Promise<Partial<ComicInterface>> => {
      return new Promise((resolve) => {
        resolve({})
      })
    },

    getChapters: async ({ siteId }): Promise<ChapterInterface[]> => {
      return new Promise((resolve) => {
        resolve([])
      })
    },

    getPages: async ({ siteLink }) => {
      return new Promise((resolve) => {
        resolve([])
      })
    }
  }
}

export default ExampleRepoPlugin
