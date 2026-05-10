import { token } from 'morgan';
import swaggerJsdoc from 'swagger-jsdoc';
require('dotenv').config();

const HOST = process.env.HOST;
const PORT = process.env.PORT;

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: "1.0.0",
    },
    servers: [
      {
        url: "{scheme}://{host}",
        variables: {
          scheme: {
            enum: ["http", "https"],
            default: "https",
          },
          host: {
            default: `${HOST}:${PORT}` || "localhost:3000",
          },
        },
      },
    ],    
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/server.ts"],
};

const swaggerOptions = {
  swaggerOptions: {
    persistAuthorization: true,
    responseInterceptor: (res: any) => {
      if (res.url.endsWith("/auth/login") && res.status === 200) {
        try {
          const data = JSON.parse(res.text);
          const token = data?.data?.token; // 🔥 token đúng chỗ
          if (token) {
            console.log("Token nhận được:", token);
            (window as any).ui?.preauthorizeApiKey("bearerAuth", token);
          }
        } catch (e) {
          console.error("Không parse được token", e);
        }
      }
      return res;
    },
  },
};

const specs = swaggerJsdoc(options);
export {specs, swaggerOptions};
