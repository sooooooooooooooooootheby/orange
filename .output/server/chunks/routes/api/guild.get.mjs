import { c as defineEventHandler, e as createError } from '../../_/nitro.mjs';
import { d as db } from '../../_/db.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:url';
import '@iconify/utils';
import 'node:crypto';
import 'consola';
import 'node:path';
import 'better-sqlite3';
import 'mysql2/promise';

const CACHE_DURATION = 5 * 60 * 1e3;
let guildCache = {
  data: null,
  timestamp: 0
};
const guild_get = defineEventHandler(async (event) => {
  const now = Date.now();
  if (guildCache.data && now - guildCache.timestamp < CACHE_DURATION) {
    return {
      success: true,
      data: guildCache.data,
      cacheTime: new Date(guildCache.timestamp).toISOString()
    };
  }
  try {
    const [rows] = await db.execute(
      "SELECT guild_name, level, money, member_count, prosperity_degree, month_prosperity_degree, member_max_count, creator, create_time FROM guild_info"
    );
    const guildData = rows;
    guildCache.data = guildData;
    guildCache.timestamp = now;
    const cacheTime = new Date(now + 8 * 60 * 60 * 1e3).toISOString();
    return {
      success: true,
      data: guildData,
      cacheTime
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "\u670D\u52A1\u5668\u9519\u8BEF2"
    });
  }
});

export { guild_get as default };
//# sourceMappingURL=guild.get.mjs.map
