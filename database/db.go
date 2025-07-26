package database

import (
	"fmt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"log"
	"os"
)

var db *gorm.DB

func Connect() {
	host := getEnv("DB_HOST", "localhost")
	user := getEnv("DB_USER", "admin")
	password := getEnv("DB_PASSWORD", "admin")
	name := getEnv("DB_NAME", "task_db")
	port := getEnv("DB_PORT", "5432")

	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=UTC",
		host, user, password, name, port,
	)

	var err error
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Не удалось подключиться к базе данных:", err)
	}
	log.Println("Подключение к базе данных успешно")
}

func GetDB() *gorm.DB {
	return db
}

func getEnv(key, def string) string {
	val := os.Getenv(key)
	if val == "" {
		return def
	}
	return val
}
