// src/routes/flashcard.route.ts
import { Router } from "express";
import { FlashcardController } from "../controllers/flashcard.controller";
import { FlashcardDeckController } from "../controllers/flashcard.deck.controller";
import Authentication from "../middleware/authentication";


const flashcardRouter = Router();

// ========================  DECK ROUTES ========================

/**
 * @swagger
 * /flashcards/decks:
 *   get:
 *     summary: Lấy danh sách tất cả flashcard deck (yêu cầu đăng nhập)
 *     tags: [Flashcards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng item mỗi trang
 *     responses:
 *       200:
 *         description: Danh sách deck với phân trang
 *         content:
 *           application/json:
 *             example:
 *               total: 2
 *               page: 1
 *               limit: 10
 *               data:
 *                 - id: 1
 *                   title: "Basic Math"
 *                   description: "Deck toán học cơ bản"
 *                 - id: 2
 *                   title: "English Vocabulary"
 *                   description: "Từ vựng tiếng Anh"
 *       401:
 *         description: Không có quyền truy cập
 */
flashcardRouter.get(
  "/decks",
  Authentication.AuthenticateToken,
  FlashcardDeckController.getAll
);

/**
 * @swagger
 * /flashcards/decks/{id}:
 *   get:
 *     summary: Get flashcard deck by ID with pagination (yêu cầu đăng nhập)
 *     tags: [Flashcards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Flashcard deck data
 *       404:
 *         description: Deck not found
 */
flashcardRouter.get(
  "/decks/:id",
  Authentication.AuthenticateToken,
  FlashcardDeckController.getById
);

/**
 * @swagger
 * /flashcards/decks/create:
 *   post:
 *     summary: Create a new deck (yêu cầu đăng nhập)
 *     tags: [Flashcards]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Sample Deck"
 *               description:
 *                 type: string
 *                 example: "This is a sample flashcard deck"
 *     responses:
 *       201:
 *         description: Deck created successfully
 */
flashcardRouter.post(
  "/decks/create",
  Authentication.AuthenticateToken,
  FlashcardDeckController.create
);

/**
 * @swagger
 * /flashcards/decks/update/{id}:
 *   put:
 *     summary: Update a flashcard deck (yêu cầu đăng nhập)
 *     tags: [Flashcards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Sample Deck updated"
 *               description:
 *                 type: string
 *                 example: "This is a sample flashcard deck updated"
 *     responses:
 *       200:
 *         description: Deck updated successfully
 *       404:
 *         description: Deck not found
 */
flashcardRouter.put(
  "/decks/update/:id",
  Authentication.AuthenticateToken,
  FlashcardDeckController.update
);

/**
 * @swagger
 * /flashcards/decks/remove/{id}:
 *   delete:
 *     summary: Delete a flashcard deck (yêu cầu đăng nhập)
 *     tags: [Flashcards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deck deleted successfully
 *       404:
 *         description: Deck not found
 */
flashcardRouter.delete(
  "/decks/remove/:id",
  Authentication.AuthenticateToken,
  FlashcardDeckController.remove
);

// FLASHCARD ROUTE

/**
 * @swagger
 * /flashcards/decks/add/{id}:
 *   post:
 *     summary: Thêm flashcard mới vào deck (yêu cầu đăng nhập)
 *     tags: [Flashcards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của deck
 *     responses:
 *       200:
 *         description: Thông tin deck
 *         content:
 *           application/json:
 *             example:
 *               id: 1
 *               title: "Basic Math"
 *               description: "Deck toán học cơ bản"
 *       404:
 *         description: Không tìm thấy deck
 */
flashcardRouter.get("/decks/:id", Authentication.AuthenticateToken, FlashcardDeckController.getById);

/**
 * @swagger
 * /flashcards/decks/create:
 *   post:
 *     summary: Tạo một deck mới (yêu cầu đăng nhập)
 *     tags: [Flashcards]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: "New Deck"
 *               description:
 *                 type: string
 *                 example: "This is a new flashcard deck"
 *     responses:
 *       201:
 *         description: Tạo deck thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
flashcardRouter.post("/decks/create", Authentication.AuthenticateToken, FlashcardDeckController.create);

/**
 * @swagger
 * /flashcards/decks/add/{id}:
 *   post:
 *     summary: Thêm flashcard mới vào một deck cụ thể (yêu cầu đăng nhập)
 *     tags: [Flashcards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của deck muốn thêm flashcard
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - front
 *               - back
 *             properties:
 *               front:
 *                 type: string
 *                 example: "What is 2 + 2?"
 *               back:
 *                 type: string
 *                 example: "4"
 *               example:
 *                 type: string
 *                 example: "Basic math question"
 *     responses:
 *       201:
 *         description: Flashcard thêm thành công
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy deck
 */

flashcardRouter.post("/decks/add/:id",
  Authentication.AuthenticateToken,
  FlashcardController.add);

/**
 * @swagger
 * /flashcards/decks/update/{id}:
 *   put:
 *     summary: Cập nhật thông tin của một deck (yêu cầu đăng nhập)
 *     tags: [Flashcards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated Deck Title"
 *               description:
 *                 type: string
 *                 example: "Updated deck description"
 *     responses:
 *       200:
 *         description: Cập nhật deck thành công
 *       404:
 *         description: Không tìm thấy deck
 */
flashcardRouter.put("/decks/update/:id", Authentication.AuthenticateToken, FlashcardDeckController.update);

/**
 * @swagger
 * /flashcards/decks/remove/{id}:
 *   delete:
 *     summary: Xóa một deck (yêu cầu đăng nhập)
 *     tags: [Flashcards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Xóa deck thành công (không có nội dung trả về)
 *       404:
 *         description: Không tìm thấy deck
 */
flashcardRouter.delete("/decks/remove/:id",
  Authentication.AuthenticateToken,
  FlashcardDeckController.remove);

// ======================== FLASHCARD ROUTES ========================

/**
 * @swagger
 * /flashcards/update/{id}:
 *   put:
 *     summary: Cập nhật một flashcard cụ thể (yêu cầu đăng nhập)
 *     tags: [Flashcards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               front:
 *                 type: string
 *                 example: "What is 3 + 3?"
 *               back:
 *                 type: string
 *                 example: "6"
 *               example:
 *                 type: string
 *                 example: "Basic addition"
 *     responses:
 *       200:
 *         description: Cập nhật flashcard thành công
 *       404:
 *         description: Không tìm thấy flashcard
 */

flashcardRouter.put(
  "/update/:id",
  Authentication.AuthenticateToken,
  FlashcardController.update
);

/**
 * @swagger
 * /flashcards/remove/{id}:
 *   delete:
 *     summary: Xóa một flashcard cụ thể (yêu cầu đăng nhập)
 *     tags: [Flashcards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Xóa flashcard thành công (không có nội dung trả về)
 *       404:
 *         description: Không tìm thấy flashcard
 */
flashcardRouter.delete("/remove/:id",
  Authentication.AuthenticateToken,
  FlashcardController.remove);

flashcardRouter.get(
  "/quiz/:id",
  Authentication.AuthenticateToken,
  FlashcardController.quiz
);

flashcardRouter.patch(
  "/quiz/submit",
  Authentication.AuthenticateToken,
  FlashcardController.submit
);

flashcardRouter.get("/review/:id",
  Authentication.AuthenticateToken,
  FlashcardController.review
)

export default flashcardRouter;
