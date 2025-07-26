package handlers

import (
	"awesomeProject/database"
	"awesomeProject/models"
	"github.com/gofiber/fiber/v2"
	"strconv"
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
	idParam := c.Params("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Неверный ID",
		})
	}

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

func UpdateTask(c *fiber.Ctx) error {
	idParam := c.Params("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Неверный ID",
		})
	}

	db := database.GetDB()
	var task models.Task
	if err := db.First(&task, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Задача не найдена",
		})
	}

	var payload map[string]interface{}
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Неверный формат данных",
		})
	}

	if err := db.Model(&task).Updates(payload).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Ошибка при обновлении",
		})
	}

	return c.JSON(task)
}
