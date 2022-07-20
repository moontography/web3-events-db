import { Pool, PoolConfig, QueryResult } from 'pg'
import { IDatabaseConnector, IStringMap } from './IDatabaseConnector'

export default function Postgres(
  connectionString: string,
  tableName?: null | string,
  extraOptions?: PoolConfig
): IDatabaseConnector {
  const connConfig: PoolConfig = {
    // ssl: { rejectUnauthorized: false },
    ...extraOptions,
    connectionString,
  }

  const pool = new Pool({
    max: 10,
    ...connConfig,
  })

  return {
    async writeRecord(eventName: string, record: IStringMap) {
      const table = tableName || `"${eventName}_web3_events_db"`
      const exists = await doesTableExist(pool, table)
      if (!exists) {
        const columnsAndTypes = Object.keys(record).reduce(
          (obj, col) => ({ ...obj, [col]: 'VARCHAR(255)' }),
          {}
        )
        await createTable(pool, table, columnsAndTypes)
      }
      const standardColReplacer = (col: string) => {
        return col
          .replace('id', 'id2')
          .replace('created_at', 'created_at2')
          .replace('updated_at', 'updated_at2')
      }

      await query(
        pool,
        `INSERT INTO ${table.replace(/'/g, "''")}
        ("${Object.keys(record)
          .map((col) => standardColReplacer(col).replace(/'/g, "''"))
          .join('", "')}")
        VALUES
        ('${Object.values(record)
          .map((val) => val.replace(/'/g, "''"))
          .join("', '")}')`
      )
    },
  }
}

export async function query(
  pool: Pool,
  query: string,
  values?: any[]
): Promise<QueryResult> {
  if (values) return await pool.query(query, values)
  return await pool.query(query)
}

export async function createTable(
  pool: Pool,
  tableName: string,
  columnsAndTypes: IStringMap
) {
  const colTypesCombined = Object.keys(columnsAndTypes).map(
    (column: string) => `"${column}" ${columnsAndTypes[column]}`
  )
  const createQuery = `CREATE TABLE IF NOT EXISTS ${tableName.replace(
    /'/g,
    "''"
  )} (
    id bigserial PRIMARY KEY,
    ${colTypesCombined.join(',\n')},
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
  );`
  await query(pool, createQuery)
}

export async function doesTableExist(pool: Pool, tableName: string) {
  const { rows } = await query(
    pool,
    `SELECT *
      FROM information_schema.columns
      WHERE table_name = $1`,
    [tableName]
  )
  return rows.length > 0
}
