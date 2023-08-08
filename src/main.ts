import { newPlugin, newUnimplementedClient } from './plugin/plugin.js';
import { createServeCommand } from './plugin/serve.js';

createServeCommand(newPlugin('test', 'v1.0.0', newUnimplementedClient)).parse();
