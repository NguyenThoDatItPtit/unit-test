require('dotenv').config();
import bodyParser from 'body-parser';
import express from 'express';
import cors from "cors";
import path from "path";
import routes from './routes/index';
import nodeCron from 'node-cron';
import StudyScheduleService from './services/schedule.study.service';
import swaggerUi from 'swagger-ui-express';
import {specs, swaggerOptions} from './config/swagger.jsdoc';
import morgan from 'morgan';
import {redis} from "./config/redis"

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// route cho api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerOptions));

app.use(
  "/resources",
  express.static(path.join(__dirname, "../resources"), {
    etag: false,
    lastModified: false,
    setHeaders: (res) => {
      res.setHeader("Cache-Control", "no-store");
    },
  })
);

// routes chung cho tat ca cac api
app.use('/', routes);

const PORT = process.env.PORT ;
const HOST = process.env.HOST ;

app.listen(PORT, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
  console.log(`Swagger docs at http://${HOST}:${PORT}/api-docs`);
  // ket oi rediss
  redis.ping()
  .then((res) => console.log("Redis connected:", res))
  .catch((err) => console.error("Redis connection failed:", err));

  // nodeCron.schedule('*/1 * * * *', async () => {
  //   // chay 1 phut 1 lan de test
  //   console.log('--- Bắt đầu tác vụ Cron: Kiểm tra và đánh dấu quá hạn ---');
  //   await StudyScheduleService.markOverTime();
  //   await ExamService.markOverTime();
  //   console.log('--- Kết thúc tác vụ Cron ---');
  // });

});

