package handlers

import (
	"awesomeProject/database"
	"awesomeProject/models"
	"encoding/json"
	"github.com/gofiber/fiber/v2"
	"strconv"
)

func CreateQuest(c *fiber.Ctx) error {
	var quest models.Question
	if err := c.BodyParser(&quest); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Неверный формат данных",
		})
	}
	var options []string
	if err := json.Unmarshal(quest.Options, &options); err != nil || len(options) < 2 {
		return c.Status(fiber.StatusBadRequest).
			JSON(fiber.Map{"error": "Некорректные данные вопроса"})
	}
	if quest.CorrectAnswer < 0 || quest.CorrectAnswer >= len(options) {
		return c.Status(fiber.StatusBadRequest).
			JSON(fiber.Map{"error": "Некорректный номер правильного ответа"})
	}
	if err := database.GetDB().Create(&quest).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Ошибка при создании вопроса"})
	}
	return c.Status(fiber.StatusCreated).JSON(quest)
}

func GetQuests(c *fiber.Ctx) error {
	var quests []models.Question
	if err := database.GetDB().Find(&quests).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Ошибка при получении вопросов",
		})
	}
	return c.JSON(quests)
}

func GetQuest(c *fiber.Ctx) error {
	var quest models.Question
	if err := database.GetDB().First(&quest, c.Params("id")).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Ошибка при получении вопроса"})
	}
	return c.JSON(quest)
}

func DeleteQuest(c *fiber.Ctx) error {
	idQuest := c.Params("id")
	id, err := strconv.Atoi(idQuest)
	db := database.GetDB()
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Неверный ID",
		})
	}

	var quest models.Question
	if err := db.First(&quest, id).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Ошибка при удалении вопроса",
		})
	}
	if err := db.Delete(&quest).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Ошибка при удалении вопроса",
		})
	}
	return c.SendStatus(fiber.StatusNoContent)
}
func UpdateQuest(c *fiber.Ctx) error {
	idQuest := c.Params("id")
	id, err := strconv.Atoi(idQuest)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Неверный ID",
		})
	}

	db := database.GetDB()
	var quest models.Question
	if err := db.First(&quest, id).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Вопрос не найден",
		})
	}
	var input models.Question
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Неверный формат данных",
		})
	}

	var options []string
	if err := json.Unmarshal(input.Options, &options); err != nil || len(options) < 2 {
		return c.Status(fiber.StatusBadRequest).
			JSON(fiber.Map{"error": "Некорректные данные вопроса"})
	}
	if input.CorrectAnswer < 0 || input.CorrectAnswer >= len(options) {
		return c.Status(fiber.StatusBadRequest).
			JSON(fiber.Map{"error": "Некорректный номер правильного ответа"})
	}

	quest.Question = input.Question
	quest.ImageURL = input.ImageURL
	quest.Options = input.Options
	quest.CorrectAnswer = input.CorrectAnswer

	if err := db.Save(&quest).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Ошибка при обновлении вопроса",
		})
	}
	return c.JSON(quest)
}
