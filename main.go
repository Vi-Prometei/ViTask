package main

import (
	"awesomeProject/database"
	"awesomeProject/handlers"
	"awesomeProject/models"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
	app := fiber.New()
	// ✅ Разрешаем запросы с других источников (например, от React фронтенда)
	app.Use(cors.New())

	database.Connect()
	db := database.GetDB() //
	db.AutoMigrate(&models.Task{})

	app.Post("/api/tasks", handlers.CreateTask)
	app.Get("/api/tasks", handlers.GetTasks)
	app.Delete("/api/tasks/:id", handlers.DeleteTask)
	app.Put("/api/tasks/:id", handlers.UpdateTask)
	app.Patch("/api/tasks/:id", handlers.UpdateTask)
	app.Listen(":3000")
}
