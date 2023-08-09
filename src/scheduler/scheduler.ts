import { SyncStream, SyncResponse, MigrateTable } from '../grpc/plugin.js';
import { ClientMeta } from '../schema/meta.js';
import { Table, encodeTable } from '../schema/table.js';

export type Options = {
  deterministicCQId: boolean;
};

export const sync = async (client: ClientMeta, tables: Table[], stream: SyncStream, options: Options) => {
  for (const table of tables) {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    stream.write(new SyncResponse({ migrate_table: new MigrateTable({ table: encodeTable(table) }) }));
  }

  stream.end();
  return await Promise.resolve();
};
