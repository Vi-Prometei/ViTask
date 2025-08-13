package handlers

import (
	"awesomeProject/database"
	"awesomeProject/models"
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
	if len(quest.Options) < 2 ||
		quest.CorrectAnswer < 0 ||
		quest.CorrectAnswer >= len(quest.Options) {
		return c.Status(fiber.StatusBadRequest).
			JSON(fiber.Map{"error": "Некорректные данные вопроса"})
	}

	if err := database.GetDB().Create(&quest).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Ошибка при создании вопроса"})
	}
	return c.Status(fiber.StatusCreated).JSON(quest) // 201
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
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Неверный ID",
		})
	}
	var quest models.Question
	if err := database.GetDB().First(&quest, id).Error; err != nil {
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
	return c.JSON(quest)
}
