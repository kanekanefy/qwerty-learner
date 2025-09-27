export default class Dexie {
  version(versionNumber: number) {
    return {
      stores(stores: any) {
        return this
      },
      upgrade(fn: any) {
        return this
      },
    }
  }
}
