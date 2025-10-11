import type { CollectionEntry } from 'astro:content'

type GroupKey = string | number | symbol

interface GroupFunction<T> {
  (item: T, index?: number): GroupKey
}

/**
 * 按指定条件对文章进行分组
 * @param posts - 文章列表
 * @param groupFunction - 分组函数，返回分组键
 * @returns 分组后的文章对象
 */
const getPostsByGroupCondition = (
  posts: CollectionEntry<'posts'>[],
  groupFunction: GroupFunction<CollectionEntry<'posts'>>,
) => {
  const result: Record<GroupKey, CollectionEntry<'posts'>[]> = {}
  for (let i = 0; i < posts.length; i++) {
    const item = posts[i]
    const groupKey = groupFunction(item, i)
    if (!result[groupKey]) {
      result[groupKey] = []
    }
    result[groupKey].push(item)
  }
  return result
}

export default getPostsByGroupCondition
