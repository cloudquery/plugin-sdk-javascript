import { createHash } from 'node:crypto';

import { v4 as uuidv4 } from 'uuid';

import { cqIDColumn } from '../schema/meta.js';
import { Resource } from '../schema/resource.js';
import { getPrimaryKeys } from '../schema/table.js';

export const setCQId = (resource: Resource, deterministicCQId: boolean, generator: () => string = uuidv4) => {
  const randomCQId = generator();
  if (!deterministicCQId) {
    resource.setCqId(randomCQId);
  }

  const primaryKeys = getPrimaryKeys(resource.table);
  const hasNonCqPKs = primaryKeys.some((pk) => pk !== cqIDColumn.name);
  if (hasNonCqPKs) {
    const sha256 = createHash('sha256');
    primaryKeys.sort();
    for (const pk of primaryKeys) {
      sha256.update(pk);
      sha256.update(resource.getColumnData(pk).toString());
    }
    return resource.setCqId(sha256.digest('hex'));
  }

  return resource.setCqId(randomCQId);
};
