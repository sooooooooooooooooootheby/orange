import { c as defineEventHandler, e as createError } from '../../../_/nitro.mjs';
import { d as db } from '../../../_/db.mjs';
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

const cache = /* @__PURE__ */ new Map();
const bans_get = defineEventHandler(async (event) => {
  try {
    const cacheKey = "bans";
    const now = Date.now();
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (now < cached.expires) {
        return {
          success: true,
          data: cached.data
        };
      }
    }
    const [rows] = await db.execute(
      `
			SELECT
				b.uuid,
				(SELECT name FROM litebans_history WHERE uuid = b.uuid LIMIT 1) AS name,
				b.reason,
				b.banned_by_name,
				b.removed_by_name,
				b.time,
				b.until,
				b.ipban
			FROM litebans_bans b;
			`
    );
    const data = rows;
    cache.set(cacheKey, {
      data,
      expires: now + 10 * 60 * 1e3
    });
    return {
      success: true,
      data
    };
  } catch (error) {
    console.log(error);
    throw createError({
      statusCode: 500,
      message: "\u670D\u52A1\u5668\u9519\u8BEF"
    });
  }
});

export { bans_get as default };
//# sourceMappingURL=bans.get.mjs.map
