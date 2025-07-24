package models

import "time"

type Task struct {
	ID          uint      `json:"id" gorm:"primaryKey"` //
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Deadline    time.Time `json:"deadline"`
	CreatedAt   time.Time
}
