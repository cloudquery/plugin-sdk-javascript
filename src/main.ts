import { newMemDBPlugin } from './memdb/memdb.js';
import { createServeCommand } from './plugin/serve.js';

createServeCommand(newMemDBPlugin()).parse();
