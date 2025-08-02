package handlers

import (
	"awesomeProject/database"
	"awesomeProject/models"
	"github.com/gofiber/fiber/v2"
)

func CreateUser(c *fiber.Ctx) error {
	var body struct {
		Login     string `json:"login"`
		Password  string `json:"password"`
		FirstName string `json:"first_name"`
		LastName  string `json:"last_name"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Неверный формат данных"})
	}

	// Проверяем, что логин свободен
	var exists models.User
	db := database.GetDB()
	if err := db.Where("login = ?", body.Login).First(&exists).Error; err == nil {
		return c.Status(409).JSON(fiber.Map{"error": "Логин уже занят"})
	}

	user := models.User{
		Login:     body.Login,
		Password:  body.Password, // в будущем лучше хэшировать!
		FirstName: body.FirstName,
		LastName:  body.LastName,
		Active:    true,
	}
	if err := db.Create(&user).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Не удалось создать пользователя"})
	}

	return c.Status(201).JSON(fiber.Map{
		"message": "Регистрация успешна",
		"user": fiber.Map{
			"id":         user.ID,
			"login":      user.Login,
			"first_name": user.FirstName,
			"last_name":  user.LastName,
		},
	})
}
func Login(c *fiber.Ctx) error {
	var body struct {
		Login    string `json:"login"`
		Password string `json:"password"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Неверный формат данных"})
	}

	var user models.User
	db := database.GetDB()
	if err := db.Where("login = ? AND password = ?", body.Login, body.Password).First(&user).Error; err != nil {
		return c.Status(401).JSON(fiber.Map{"error": "Неверный логин или пароль"})
	}

	return c.JSON(fiber.Map{
		"message": "Вход выполнен",
		"user": fiber.Map{
			"id":         user.ID,
			"login":      user.Login,
			"first_name": user.FirstName,
			"last_name":  user.LastName,
		},
	})
}
func GetMe(c *fiber.Ctx) error {
	userID := c.Get("X-User-ID")
	if userID == "" {
		return c.Status(401).JSON(fiber.Map{"error": "Нет авторизации"})
	}

	var user models.User
	db := database.GetDB()
	if err := db.First(&user, userID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Пользователь не найден"})
	}

	return c.JSON(fiber.Map{
		"id":         user.ID,
		"login":      user.Login,
		"first_name": user.FirstName,
		"last_name":  user.LastName,
	})
}
