import assert from 'assert'
import { Pool } from 'pg'
import { query, createTable, doesTableExist } from './Postgres'

const connectionString = 'postgres://localhost:5432/web3_test'

describe('Postgres', function () {
  const sampleColumns = {
    col1: 'varchar(255)',
    col2: 'integer',
  }
  let pool: Pool
  this.beforeAll(function () {
    pool = new Pool({
      connectionString,
    })
  })

  this.afterAll(function () {
    pool.end()
  })

  describe('#createTable & #doesTableExist', function () {
    it(`should determine if tables exist, create them, and report accurately`, async function () {
      const shouldNotExist = await doesTableExist(pool, `does_not_exist`)
      await createTable(pool, 'will_exist_now', sampleColumns)
      const shouldExist = await doesTableExist(pool, `will_exist_now`)
      await query(pool, `drop table will_exist_now`)
      const shouldNowNoLongerExist = await doesTableExist(
        pool,
        `will_exist_now`
      )

      assert.strictEqual(shouldNotExist, false)
      assert.strictEqual(shouldExist, true)
      assert.strictEqual(shouldNowNoLongerExist, false)
    })
  })

  describe('#query', function () {
    before(async function () {
      await createTable(pool, `my_query_table`, sampleColumns)
    })

    after(async function () {
      await query(pool, `drop table my_query_table`)
    })

    it(`should query for data and return accurate results`, async function () {
      const { rows: shouldHaveNoRows } = await query(
        pool,
        `select * from my_query_table`
      )
      await query(
        pool,
        `insert into my_query_table (col1, col2) VALUES ('yo', 2)`
      )
      const { rows: shouldHaveRows } = await query(
        pool,
        `select * from my_query_table`
      )

      assert.strictEqual(shouldHaveNoRows.length, 0)
      assert.strictEqual(shouldHaveRows.length, 1)
      assert.strictEqual(shouldHaveRows[0].col1, 'yo')
      assert.strictEqual(shouldHaveRows[0].col2, 2)
    })
  })
})
