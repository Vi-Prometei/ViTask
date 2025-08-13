package main

import (
	"awesomeProject/database"
	"awesomeProject/handlers"
	"awesomeProject/models"
	"awesomeProject/repositories"
	"awesomeProject/yandex"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
	app := fiber.New()
	app.Use(cors.New())
	app.Static("/", "./static")
	database.Connect()
	db := database.GetDB() //
	db.AutoMigrate(&models.Task{}, &models.User{}, &models.Question{}, &models.Vote{})
	taskRepo := repositories.NewTaskRepo(db)
	app.Post("/api/tasks", handlers.MakeCreateTaskHandler(taskRepo))
	//app.Post("/api/tasks", handlers.CreateTask)
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

	app.Post("/api/quest", handlers.CreateQuest)
	app.Get("/api/quest", handlers.GetQuest)
	app.Delete("/api/quest/:id", handlers.DeleteQuest)
	app.Put("/api/quest/:id", handlers.UpdateQuest)

	app.Listen(":8080")
}
