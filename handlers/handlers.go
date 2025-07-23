package handlers

import (
	"ViTask/database"
	"ViTask/models"
	"github.com/gofiber/fiber/v2"
)

func CreateTask(c *fiber.Ctx) error {
	var task models.Task

	if err := c.BodyParser(&task); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Неверный формат данных",
		})
	}

	if err := database.GetDB().Create(&task).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Ошибка при создании задачи",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(task)
}
func GetTasks(c *fiber.Ctx) error {
	var tasks []models.Task
	if err := database.GetDB().Find(&tasks).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Ошибка при получении задач",
		})
	}
	return c.JSON(tasks)
}
func DeleteTask(c *fiber.Ctx) error {
	id := c.Params("id")
	var task models.Task

	db := database.GetDB()
	if err := db.First(&task, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Задача не найдена",
		})
	}

	if err := db.Delete(&task).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Ошибка при удалении",
		})
	}

	return c.SendStatus(fiber.StatusNoContent)
}
