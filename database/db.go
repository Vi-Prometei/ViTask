package database

import (
	"fmt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"log"
)

var db *gorm.DB

func Connect() {
	dsn := fmt.Sprintf(
		"host=localhost user=admin password=admin dbname=task_db port=5432 sslmode=disable TimeZone=UTC",
	)

	var err error
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("❌ Не удалось подключиться к базе данных:", err)
	}
	log.Println("✅ Подключение к базе данных успешно")
}

func GetDB() *gorm.DB {
	return db
}
