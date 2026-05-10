import pool from "../config/database";
import { DateProp } from "../models/dashboard.model";
import { withCache } from "../utils/helper";

export const DashBoardService = {

  /* ================= CARD ================= */
  async getDashboardStatsCard(date: DateProp) {
    const cacheKey = `dashboard:card:${date.year}-${date.month}`;

    return withCache(cacheKey, 300, async () => {
      const client = await pool.connect();
      try {
        const currentStart = new Date(Date.UTC(date.year, date.month - 1, 1));
        const currentEnd = new Date(Date.UTC(date.year, date.month, 1));
        const prevStart = new Date(Date.UTC(date.year, date.month - 2, 1));
        const prevEnd = new Date(Date.UTC(date.year, date.month - 1, 1));

        const sql = `
          SELECT
            COUNT(history_exam_id) FILTER (WHERE created_at >= $1 AND created_at < $2)::int AS current_submits,
            COUNT(DISTINCT user_id) FILTER (WHERE created_at >= $1 AND created_at < $2)::int AS current_users,
            ROUND(COALESCE(AVG(score) FILTER (WHERE created_at >= $1 AND created_at < $2), 0), 2) AS current_score,
            COUNT(score) FILTER (WHERE score >= 5 AND created_at >= $1 AND created_at < $2)::int AS current_standard_score,

            COUNT(history_exam_id) FILTER (WHERE created_at >= $3 AND created_at < $4)::int AS prev_submits,
            COUNT(DISTINCT user_id) FILTER (WHERE created_at >= $3 AND created_at < $4)::int AS prev_users,
            ROUND(COALESCE(AVG(score) FILTER (WHERE created_at >= $3 AND created_at < $4), 0), 2) AS prev_score,
            COUNT(score) FILTER (WHERE score >= 5 AND created_at >= $3 AND created_at < $4)::int AS prev_standard_score
          FROM history_exam;
        `;

        const { rows } = await client.query(sql, [
          currentStart,
          currentEnd,
          prevStart,
          prevEnd,
        ]);

        const d = rows[0];

        const calcChange = (c: number, p: number) =>
          p === 0 ? (c === 0 ? 0 : 100) : ((c - p) / p) * 100;

        const popularSql = `
          SELECT sj.subject_name, COUNT(*)::int AS total
          FROM history_exam he
          JOIN exam e ON e.exam_id = he.exam_id
          JOIN topic t ON e.topic_id = t.topic_id
          JOIN subject sj ON sj.subject_id = t.subject_id
          WHERE he.created_at >= $1 AND he.created_at < $2
          GROUP BY sj.subject_name
          ORDER BY total DESC
          LIMIT 1;
        `;

        const popular =
          (await client.query(popularSql, [currentStart, currentEnd])).rows[0]
          ?? { subject_name: null, total: 0 };

        const userSql = `
          SELECT
            COUNT(user_id) FILTER (WHERE created_at >= $1 AND created_at < $2)::int AS current_user_new,
            COUNT(user_id) FILTER (WHERE created_at >= $3 AND created_at < $4)::int AS prev_user_new
          FROM "user";
        `;

        const u = (await client.query(userSql, [
          currentStart,
          currentEnd,
          prevStart,
          prevEnd,
        ])).rows[0];

        return {
          overview: {
            submits: { total: d.current_submits, change: calcChange(d.current_submits, d.prev_submits).toFixed(2) },
            users: { total: d.current_users, change: calcChange(d.current_users, d.prev_users).toFixed(2) },
            score: { total: d.current_score, change: calcChange(d.current_score, d.prev_score).toFixed(2) },
            users_new: { total: u.current_user_new, change: calcChange(u.current_user_new, u.prev_user_new).toFixed(2) },
            standard_score: {
              total: d.current_standard_score,
              change: calcChange(d.current_standard_score, d.prev_standard_score).toFixed(2),
            },
            popular_subject: popular,
          },
        };
      } finally {
        client.release();
      }
    });
  },

  /* ================= LINE ================= */
  async getDashboardStatsLine() {
    return withCache("dashboard:line:30days", 300, async () => {
      const sql = `
        SELECT
          to_char(d.day, 'YYYY-MM-DD') AS date,
          COUNT(u.user_id)::int AS value
        FROM generate_series(
          (CURRENT_DATE AT TIME ZONE 'UTC') - INTERVAL '29 days',
          (CURRENT_DATE AT TIME ZONE 'UTC'),
          INTERVAL '1 day'
        ) AS d(day)
        LEFT JOIN "user" u
          ON u.created_at >= d.day
         AND u.created_at < d.day + INTERVAL '1 day'
        GROUP BY d.day
        ORDER BY d.day;
      `;

      const { rows } = await pool.query(sql);
      return { line: rows };
    });
  },

  /* ================= PIE ================= */
  async getDashboardStatsPie() {
    return withCache("dashboard:pie", 600, async () => {
      const client = await pool.connect();
      try {
        const scoreSql = `
          SELECT
            sj.subject_name,
            COUNT(*) FILTER (WHERE he.score >= 8) AS gioi,
            COUNT(*) FILTER (WHERE he.score >= 6.5 AND he.score < 8) AS kha,
            COUNT(*) FILTER (WHERE he.score >= 5 AND he.score < 6.5) AS trung_binh,
            COUNT(*) FILTER (WHERE he.score < 5) AS yeu
          FROM history_exam he
          JOIN exam e ON e.exam_id = he.exam_id
          JOIN topic t ON e.topic_id = t.topic_id
          JOIN subject sj ON sj.subject_id = t.subject_id
          GROUP BY sj.subject_name;
        `;

        const joinSql = `
          SELECT sj.subject_name, COUNT(*)::int AS total
          FROM history_exam he
          JOIN exam e ON e.exam_id = he.exam_id
          JOIN topic t ON e.topic_id = t.topic_id
          JOIN subject sj ON sj.subject_id = t.subject_id
          GROUP BY sj.subject_name;
        `;

        const doneSql = `
          SELECT sj.subject_name, COUNT(*)::int AS total
          FROM history_exam he
          JOIN exam e ON e.exam_id = he.exam_id
          JOIN topic t ON e.topic_id = t.topic_id
          JOIN subject sj ON sj.subject_id = t.subject_id
          WHERE he.score >= 5
          GROUP BY sj.subject_name;
        `;

        const [scoreRes, joinRes, doneRes] = await Promise.all([
          client.query(scoreSql),
          client.query(joinSql),
          client.query(doneSql),
        ]);

        const scoreData: any = {};
        scoreRes.rows.forEach(r => {
          scoreData[r.subject_name] = [
            Number(r.gioi),
            Number(r.kha),
            Number(r.trung_binh),
            Number(r.yeu),
          ];
        });

        const joinData: any = {};
        joinRes.rows.forEach(r => joinData[r.subject_name] = r.total);

        const doneData: any = {};
        doneRes.rows.forEach(r => doneData[r.subject_name] = r.total);

        return {
          score: {
            labels: ["Giỏi (≥8)", "Khá (6.5–7.9)", "Trung bình (5–6.4)", "Yếu (<5)"],
            data: scoreData,
          },
          subject_join: { labels: Object.keys(joinData), data: joinData },
          subject_done: { labels: Object.keys(doneData), data: doneData },
        };
      } finally {
        client.release();
      }
    });
  },

  /* ================= BAR ================= */
  async getDashboardStatsBar() {
    return withCache("dashboard:bar", 600, async () => {
      const client = await pool.connect();
      try {
        const dauSql = `
          SELECT to_char(d, 'Dy') AS label, COUNT(DISTINCT he.user_id)::int AS value
          FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, INTERVAL '1 day') d
          LEFT JOIN history_exam he ON DATE(he.created_at) = d
          GROUP BY d ORDER BY d;
        `;

        const wauSql = `
          SELECT 'Week ' || EXTRACT(WEEK FROM d)::int AS label, COUNT(DISTINCT he.user_id)::int AS value
          FROM generate_series(CURRENT_DATE - INTERVAL '4 weeks', CURRENT_DATE, INTERVAL '1 week') d
          LEFT JOIN history_exam he ON he.created_at >= d AND he.created_at < d + INTERVAL '1 week'
          GROUP BY d ORDER BY d;
        `;

        const mauSql = `
          SELECT to_char(d, 'Mon') AS label, COUNT(DISTINCT he.user_id)::int AS value
          FROM generate_series(
            date_trunc('month', CURRENT_DATE) - INTERVAL '2 months',
            date_trunc('month', CURRENT_DATE),
            INTERVAL '1 month'
          ) d
          LEFT JOIN history_exam he ON date_trunc('month', he.created_at) = d
          GROUP BY d ORDER BY d;
        `;

        const [dau, wau, mau] = await Promise.all([
          client.query(dauSql),
          client.query(wauSql),
          client.query(mauSql),
        ]);

        const mapChart = (rows: any[], label: string) => ({
          labels: rows.map(r => r.label),
          datasets: [{ label, data: rows.map(r => r.value) }],
        });

        return {
          dau: mapChart(dau.rows, "DAU"),
          wau: mapChart(wau.rows, "WAU"),
          mau: mapChart(mau.rows, "MAU"),
        };
      } finally {
        client.release();
      }
    });
  },

  /* ================= TABLE ================= */
  async getDashboardStatsTable() {
    const cacheKey = "dashboard:table:7days";

    return withCache(cacheKey, 300, async () => {
      const sql = `
        SELECT
          to_char(d.day, 'YYYY-MM-DD') AS date,
          COUNT(DISTINCT he.user_id)::int AS active_users,
          ROUND(
            COUNT(DISTINCT he.user_id)::decimal /
            NULLIF((SELECT COUNT(*) FROM "user"), 0),
            2
          ) AS user_ratio,
          ROUND(AVG(cnt)::numeric, 2) AS avg_session,
          PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY cnt) AS median_session
        FROM generate_series(
          CURRENT_DATE - INTERVAL '6 days',
          CURRENT_DATE,
          INTERVAL '1 day'
        ) d(day)
        LEFT JOIN (
          SELECT user_id, DATE(created_at) d, COUNT(*) cnt
          FROM history_exam
          GROUP BY user_id, DATE(created_at)
        ) he ON he.d = d.day
        GROUP BY d.day
        ORDER BY d.day;
      `;

      const { rows } = await pool.query(sql);

      return rows.map((r) => ({
        date: r.date,
        activeUsers: Number(r.active_users),
        userRatio: Number(r.user_ratio ?? 0),
        avgSession: Number(r.avg_session ?? 0),
        medianSession: Number(r.median_session ?? 0),
      }));
    });
  },
};
