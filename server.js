const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// ── PostgreSQL 数据库连接 ──────────────────────────────────────────
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('数据库连接失败:', err.stack);
  } else {
    console.log('✅ 已连接 PostgreSQL 数据库');
    release();
  }
});

// ── 数据库初始化 ──────────────────────────────────────────
const initDB = async () => {
  try {
    // 创建表（如果不存在）
    await pool.query(`
      CREATE TABLE IF NOT EXISTS restaurants (
        id         SERIAL PRIMARY KEY,
        name       TEXT    NOT NULL,
        cuisine    TEXT    NOT NULL,
        rating     REAL    DEFAULT 4.0,
        price      TEXT    DEFAULT '面议',
        location   TEXT    DEFAULT '未知',
        tags       TEXT    DEFAULT '[]'
      )
    `);
    console.log('✅ 数据表就绪');

    // 检查是否已有数据
    const countRes = await pool.query('SELECT COUNT(*) as cnt FROM restaurants');
    const count = parseInt(countRes.rows[0].cnt);

    if (count === 0) {
      // 导入种子数据
      const seeds = [
        { name: "KFC 肯德基", cuisine: "西式快餐", rating: 4.3, price: "30–50元", location: "广场内", tags: '["汉堡","炸鸡","可乐"]' },
        { name: "尊宝比萨", cuisine: "西式披萨", rating: 4.2, price: "35–55元", location: "广场内", tags: '["披萨","意面","小食"]' },
        { name: "塔斯汀中国汉堡", cuisine: "中式汉堡快餐", rating: 4.2, price: "18–30元", location: "广场内", tags: '["中国堡","烤饼","小食"]' },
        { name: "梁记柳州螺蛳粉", cuisine: "广西螺蛳粉", rating: 4.3, price: "18–28元", location: "广场内", tags: '["螺蛳粉","酸笋","腐竹"]' },
        { name: "巧姑姑麻辣烫·小锅米线", cuisine: "川味麻辣烫", rating: 4.2, price: "20–35元", location: "广场内", tags: '["麻辣烫","小锅米线","串串"]' },
        { name: "拌粉君", cuisine: "江西拌粉", rating: 4.2, price: "18–30元", location: "广场内", tags: '["拌粉","瓦罐汤","南昌味"]' },
        { name: "汤小掌鲜米粉", cuisine: "粤式汤粉", rating: 4.1, price: "15–28元", location: "广场内", tags: '["鲜米粉","高汤","配菜"]' },
        { name: "米范先生", cuisine: "米线/快餐", rating: 4.0, price: "18–30元", location: "广场内", tags: '["米线","快餐","小食"]' },
        { name: "粉面小厨", cuisine: "中式粉面", rating: 4.1, price: "18–30元", location: "广场内", tags: '["粉面","小炒","盖饭"]' },
        { name: "河湟牛肉拉面", cuisine: "西北拉面", rating: 4.1, price: "20–35元", location: "广场内", tags: '["拉面","牛肉","西北风味"]' },
        { name: "青海手工牛肉面", cuisine: "西北拉面", rating: 4.1, price: "20–35元", location: "广场内", tags: '["手工面","牛肉","西北风味"]' },
        { name: "遇见小面", cuisine: "重庆小面", rating: 4.2, price: "20–32元", location: "广场内", tags: '["重庆小面","川渝","红油"]' },
        { name: "潮汕华发牛肉店", cuisine: "潮汕牛肉火锅", rating: 4.5, price: "65–100元", location: "广场内", tags: '["牛肉火锅","鲜切","手打丸"]' },
        { name: "欢喜潮汕牛肉店", cuisine: "潮汕牛肉火锅", rating: 4.4, price: "60–95元", location: "广场内", tags: '["潮汕火锅","吊龙","匙仁"]' },
        { name: "汕头牛肉店", cuisine: "潮汕牛肉火锅", rating: 4.3, price: "60–90元", location: "广场内", tags: '["汕头","鲜切牛肉","沙茶酱"]' },
        { name: "客家腌面", cuisine: "客家菜", rating: 4.2, price: "15–28元", location: "广场内", tags: '["腌面","三及第","客家味"]' },
        { name: "陈记三及第", cuisine: "客家三及第汤粉", rating: 4.2, price: "15–25元", location: "广场内", tags: '["三及第","汤粉","枸杞汤"]' },
        { name: "臻味腌面", cuisine: "客家菜", rating: 4.1, price: "15–28元", location: "广场内", tags: '["腌面","客家","简餐"]' },
        { name: "荔圆蒸饭", cuisine: "粤式蒸饭快餐", rating: 4.1, price: "15–28元", location: "广场内", tags: '["蒸饭","腊味","豉汁"]' },
        { name: "原味汤粉王", cuisine: "粤式汤粉", rating: 4.0, price: "12–22元", location: "广场内", tags: '["汤粉","高汤","经济"]' },
        { name: "袁记云饺", cuisine: "广东饺子/云吞", rating: 4.4, price: "20–35元", location: "广场内", tags: '["云吞","水饺","广式"]' },
        { name: "老北方饺子馆", cuisine: "北方饺子", rating: 4.0, price: "18–30元", location: "广场内", tags: '["饺子","北方","手擀皮"]' },
        { name: "珍珠基皇后水饺", cuisine: "水饺/快餐", rating: 4.0, price: "15–28元", location: "广场内", tags: '["水饺","快餐","实惠"]' },
        { name: "美味苑", cuisine: "粤式快餐", rating: 4.1, price: "18–30元", location: "广场内", tags: '["粤式","快餐","小炒"]' },
        { name: "韬味园", cuisine: "粤式快餐/小炒", rating: 4.0, price: "20–35元", location: "广场内", tags: '["粤式","小炒","快餐"]' },
        { name: "永年士多", cuisine: "粤式快餐", rating: 4.0, price: "18–30元", location: "广场内", tags: '["粤式","快餐","经济"]' },
        { name: "沙县小吃", cuisine: "福建小吃", rating: 4.0, price: "12–22元", location: "广场内", tags: '["沙县","小吃","拌面","馄饨"]' },
        { name: "小女当家", cuisine: "自选快餐", rating: 4.1, price: "18–30元", location: "广场内", tags: '["自选","快餐","称重"]' },
        { name: "老湖南", cuisine: "湘菜", rating: 4.2, price: "40–65元", location: "广场内", tags: '["湘菜","剁椒鱼头","小炒肉"]' },
        { name: "小辣椒（大厨房）", cuisine: "湘菜/川菜", rating: 4.3, price: "45–70元", location: "广场内", tags: '["湘菜","川菜","重口味"]' },
        { name: "湘小小", cuisine: "湘菜快餐", rating: 4.2, price: "18–30元", location: "广场内", tags: '["湘味","快餐","小炒"]' },
        { name: "四川豆花", cuisine: "传统川菜", rating: 4.3, price: "40–65元", location: "广场内", tags: '["川菜","豆花","回锅肉"]' },
        { name: "冒菜大王", cuisine: "川渝冒菜", rating: 4.1, price: "25–40元", location: "广场内", tags: '["冒菜","麻辣","自选"]' },
        { name: "王同学串串", cuisine: "串串香/川渝小吃", rating: 4.2, price: "30–50元", location: "广场内", tags: '["串串","麻辣","自选"]' },
        { name: "鱼脆米香（中山脆肉鲩火锅）", cuisine: "粤菜/火锅", rating: 4.4, price: "60–90元", location: "广场内", tags: '["脆肉鲩","火锅","粤式"]' },
        { name: "张记烤鱼", cuisine: "重庆烤鱼", rating: 4.1, price: "50–80元", location: "广场内", tags: '["烤鱼","麻辣","香辣"]' },
        { name: "鱼你在一起", cuisine: "酸菜鱼/川菜", rating: 4.2, price: "35–60元", location: "广场内", tags: '["酸菜鱼","川菜","快餐化"]' },
        { name: "潮式自选快餐", cuisine: "潮汕风味快餐", rating: 4.1, price: "18–30元", location: "广场内", tags: '["潮汕","自选","快餐"]' },
        { name: "江西小炒", cuisine: "江西家常菜", rating: 4.0, price: "35–55元", location: "广场内", tags: '["赣菜","小炒","下饭菜"]' },
        { name: "余百年", cuisine: "江西风味/快餐", rating: 4.1, price: "18–30元", location: "广场内", tags: '["赣味","快餐","小炒"]' },
        { name: "六月荔园（现炒自选快餐）", cuisine: "湘味快餐", rating: 4.2, price: "18–30元", location: "广场内", tags: '["湘味","现炒","自选"]' },
        { name: "勇大厨", cuisine: "中式快餐", rating: 4.0, price: "20–35元", location: "广场内", tags: '["中式","快餐","小炒"]' },
        { name: "隆江猪脚饭", cuisine: "潮汕猪脚饭", rating: 4.2, price: "18–32元", location: "广场内", tags: '["猪脚饭","潮汕","卤味"]' },
        { name: "李大爷馄饨花甲粉", cuisine: "馄饨/花甲粉", rating: 4.1, price: "15–28元", location: "广场内", tags: '["馄饨","花甲粉","汤粉"]' },
      ];

      for (const r of seeds) {
        await pool.query(
          'INSERT INTO restaurants (name, cuisine, rating, price, location, tags) VALUES ($1, $2, $3, $4, $5, $6)',
          [r.name, r.cuisine, r.rating, r.price, r.location, r.tags]
        );
      }
      console.log(`🌱 已导入 ${seeds.length} 条初始数据`);
    } else {
      console.log(`📦 数据库已有 ${count} 条记录，跳过初始化`);
    }
  } catch (err) {
    console.error('数据库初始化失败:', err);
  }
};

initDB();

// ── 工具函数 ──────────────────────────────────────────────
function parseRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    cuisine: row.cuisine,
    rating: row.rating,
    price: row.price,
    location: row.location,
    tags: JSON.parse(row.tags || '[]'),
  };
}

// ── API：查全部（支持 ?cuisine=xxx 筛选）───────────────────
app.get('/api/restaurants', async (req, res) => {
  const { cuisine } = req.query;
  try {
    let result;
    if (cuisine && cuisine !== 'all') {
      result = await pool.query('SELECT * FROM restaurants WHERE cuisine LIKE $1 ORDER BY id', [`%${cuisine}%`]);
    } else {
      result = await pool.query('SELECT * FROM restaurants ORDER BY id');
    }
    res.json(result.rows.map(parseRow));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── API：查单条 ────────────────────────────────────────────
app.get('/api/restaurants/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM restaurants WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: '餐厅不存在' });
    res.json(parseRow(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── API：增 ────────────────────────────────────────────────
app.post('/api/restaurants', async (req, res) => {
  const { name, cuisine, rating, price, location } = req.body;
  if (!name || !cuisine) {
    return res.status(400).json({ error: '名称和菜系为必填项' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO restaurants (name, cuisine, rating, price, location, tags) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, cuisine, rating ?? 4.0, price ?? '面议', location ?? '未知', '[]']
    );
    res.status(201).json(parseRow(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── API：改 ───────────────────────────────────────────────
app.put('/api/restaurants/:id', async (req, res) => {
  const { name, cuisine, rating, price, location } = req.body;
  try {
    const result = await pool.query(
      `UPDATE restaurants SET 
        name = COALESCE($1, name), 
        cuisine = COALESCE($2, cuisine), 
        rating = COALESCE($3, rating), 
        price = COALESCE($4, price), 
        location = COALESCE($5, location) 
       WHERE id = $6 
       RETURNING *`,
      [name || null, cuisine || null, rating ?? null, price || null, location || null, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: '餐厅不存在' });
    res.json(parseRow(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── API：删 ───────────────────────────────────────────────
app.delete('/api/restaurants/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM restaurants WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: '餐厅不存在' });
    res.json({ success: true, id: parseInt(result.rows[0].id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── 启动 ──────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 服务器已启动 → http://localhost:${PORT}`);
  console.log(`📋 API 文档:`);
  console.log(`   GET    /api/restaurants         # 查全部`);
  console.log(`   GET    /api/restaurants/:id    # 查单条`);
  console.log(`   POST   /api/restaurants         # 新增`);
  console.log(`   PUT    /api/restaurants/:id     # 修改`);
  console.log(`   DELETE /api/restaurants/:id     # 删除`);
});
