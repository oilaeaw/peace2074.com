import { randomUUID } from 'node:crypto'

type JsonObject = Record<string, any>

function matchesFilter(doc: JsonObject, filter: JsonObject = {}) {
    return Object.entries(filter).every(([key, value]) => doc?.[key] === value)
}

async function readCollection(name: string) {
    const storage = useStorage('data')
    const key = `db:${name}`
    const items = (await storage.getItem<JsonObject[]>(key)) || []
    return { storage, key, items }
}

async function writeCollection(storage: Storage, key: string, items: JsonObject[]) {
    await storage.setItem(key, items)
}

export async function getCollection(name: string) {
    return {
        async findOne(filter: JsonObject = {}) {
            const { items } = await readCollection(name)
            return items.find((item) => matchesFilter(item, filter)) || null
        },

        find(filter: JsonObject = {}) {
            const makeCursor = (sortArg?: JsonObject) => ({
                async toArray() {
                    const { items } = await readCollection(name)
                    const filtered = items.filter((item) => matchesFilter(item, filter))

                    if (!sortArg) return filtered

                    const [[sortKey, sortDir]] = Object.entries(sortArg)
                    return [...filtered].sort((a, b) => {
                        if (a?.[sortKey] === b?.[sortKey]) return 0
                        const direction = sortDir === -1 ? -1 : 1
                        return a?.[sortKey] > b?.[sortKey] ? direction : -direction
                    })
                },
            })

            return {
                sort(sortArg: JsonObject) {
                    return makeCursor(sortArg)
                },
                toArray: makeCursor().toArray,
            }
        },

        async insertOne(doc: JsonObject) {
            const { storage, key, items } = await readCollection(name)
            const _id = doc?._id || randomUUID()
            const record = { ...doc, _id }
            items.push(record)
            await writeCollection(storage, key, items)
            return { insertedId: _id }
        },

        async updateOne(filter: JsonObject = {}, update: JsonObject = {}) {
            const { storage, key, items } = await readCollection(name)
            const index = items.findIndex((item) => matchesFilter(item, filter))
            if (index === -1) {
                return { matchedCount: 0, modifiedCount: 0 }
            }

            const setPatch = update?.$set || {}
            items[index] = { ...items[index], ...setPatch }
            await writeCollection(storage, key, items)

            return { matchedCount: 1, modifiedCount: 1 }
        },

        async findOneAndUpdate(filter: JsonObject = {}, update: JsonObject = {}) {
            const { storage, key, items } = await readCollection(name)
            const index = items.findIndex((item) => matchesFilter(item, filter))
            if (index === -1) return null

            const setPatch = update?.$set || {}
            items[index] = { ...items[index], ...setPatch }
            await writeCollection(storage, key, items)

            return items[index]
        },

        async deleteOne(filter: JsonObject = {}) {
            const { storage, key, items } = await readCollection(name)
            const index = items.findIndex((item) => matchesFilter(item, filter))
            if (index === -1) {
                return { deletedCount: 0 }
            }

            items.splice(index, 1)
            await writeCollection(storage, key, items)
            return { deletedCount: 1 }
        },
    }
}
