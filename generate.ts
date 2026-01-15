import { basename, join } from 'node:path'
import {
  existsSync,
  globSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs'

const SOURCE_PATTERN = './sentences-bundle/sentences/*.json'
const DATA_DIR = 'data'
const CATEGORY_DIR = 'categorys'

const DATA_FILE_NUM = 65536 // 0000.json - FFFF.json
const CATEGORY_FILE_NUM = 4096 // 000.json - FFF.json

function main() {
  // 获取所有句子
  const allSentences = []
  for (const file of globSync(SOURCE_PATTERN)) {
    try {
      const content = readFileSync(file, 'utf-8')
      const data = JSON.parse(content)
      if (Array.isArray(data)) {
        allSentences.push(...data)
      }
    } catch (error) {
      console.error(`Failed to parse file ${file}:`, error)
    }
  }

  if (allSentences.length === 0) {
    console.error('No data, END....')
    return
  }

  console.log(
    `Found ${allSentences.length} sentences, begin generate data and categorys...`,
  )

  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true })
  }

  if (!existsSync(CATEGORY_DIR)) {
    mkdirSync(CATEGORY_DIR, { recursive: true })
  }

  // 以所有句子生成 data 目录
  for (let i = 0; i < DATA_FILE_NUM; i++) {
    const item = allSentences[i % allSentences.length]
    const fileName = i.toString(16).toUpperCase().padStart(4, '0')
    const filePath = join(DATA_DIR, `${fileName}.json`)

    writeFileSync(filePath, JSON.stringify(item))
  }

  console.log(`Generated ${DATA_FILE_NUM} data files`)

  // 按类型生成 category 目录
  for (const file of globSync(SOURCE_PATTERN)) {
    const category_name = basename(file, '.json')
    const category_dir = join(CATEGORY_DIR, category_name)
    if (!existsSync(category_dir)) {
      mkdirSync(category_dir, { recursive: true })
    }

    try {
      const content = readFileSync(file, 'utf-8')
      const data = JSON.parse(content)
      if (Array.isArray(data)) {
        for (let i = 0; i < CATEGORY_FILE_NUM; i++) {
          const item = data[i % data.length]
          const fileName = i.toString(16).toUpperCase().padStart(
            3,
            '0',
          )
          const filePath = join(category_dir, `${fileName}.json`)

          writeFileSync(filePath, JSON.stringify(item))
        }
      }
    } catch (error) {
      console.error(`Failed to parse file ${file}:`, error)
    }

    console.log(
      `Generated ${category_name}, ${CATEGORY_FILE_NUM} category files`,
    )
  }

  console.log('END....')
}

main()
