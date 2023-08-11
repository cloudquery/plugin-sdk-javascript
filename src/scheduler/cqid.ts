import { createHash } from 'node:crypto';

import { v4 as uuidv4, v5 as uuidv5, NIL as NIL_UUID } from 'uuid';

import { cqIDColumn } from '../schema/meta.js';
import { Resource } from '../schema/resource.js';
import { getPrimaryKeys } from '../schema/table.js';

export const setCQId = (resource: Resource, deterministicCQId: boolean, generator: () => string = uuidv4) => {
  const randomCQId = generator();
  if (!deterministicCQId) {
    return resource.setCqId(randomCQId);
  }

  const primaryKeys = getPrimaryKeys(resource.table);
  const cqOnlyPK = primaryKeys.every((pk) => pk === cqIDColumn.name);
  if (cqOnlyPK) {
    return resource.setCqId(randomCQId);
  }

  const sha256 = createHash('sha256');
  primaryKeys.sort();
  for (const pk of primaryKeys) {
    sha256.update(pk);
    sha256.update(resource.getColumnData(pk).toString());
  }
  return resource.setCqId(uuidv5(sha256.digest('hex'), NIL_UUID));
};
