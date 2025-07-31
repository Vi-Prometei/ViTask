package main

import (
	"awesomeProject/database"
	"awesomeProject/handlers"
	"awesomeProject/models"
	"awesomeProject/yandex"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
	app := fiber.New()
	app.Use(cors.New())

	database.Connect()
	db := database.GetDB() //
	db.AutoMigrate(&models.Task{}, &models.User{})

	app.Post("/api/tasks", handlers.CreateTask)
	app.Get("/api/tasks", handlers.GetTasks)
	app.Delete("/api/tasks/:id", handlers.DeleteTask)
	app.Put("/api/tasks/:id", handlers.UpdateTask)
	app.Patch("/api/tasks/:id", handlers.UpdateTask)

	app.Post("/api/users/register", handlers.CreateUser)
	app.Post("/api/users/login", handlers.Login)
	app.Get("/api/me", handlers.GetMe)

	app.Get("/api/disk/files", yandex.GetDiskFiles)
	app.Post("/api/disk/upload", yandex.UploadDiskFile)
	app.Get("/api/disk/download", yandex.DownloadDiskFile)

	app.Listen(":3000")
}
