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
const kicks_get = defineEventHandler(async (event) => {
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
				t.uuid,
				(SELECT name FROM litebans_history WHERE uuid = t.uuid LIMIT 1) AS name,
				JSON_ARRAYAGG(
				JSON_OBJECT(
					'reason', t.reason,
					'reason_count', t.reason_count
				)
			) AS kick,
			SUM(t.reason_count) AS kick_count
			FROM (
				SELECT
					k.uuid,
					k.reason,
					COUNT(*) AS reason_count,
					MAX(k.banned_by_name) AS banned_by_name,
					MAX(k.time) AS last_time
				FROM litebans_kicks k
				GROUP BY k.uuid, k.reason
			) t
			GROUP BY t.uuid;
			`
    );
    const data = rows;
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

export { kicks_get as default };
//# sourceMappingURL=kicks.get.mjs.map
