package models

import "time"

type User struct {
	Login     string    `gorm:"unique;not null" json:"login"`
	Password  string    `gorm:"not null" json:"-"`
	ID        uint      `gorm:"primaryKey" json:"id"`
	FirstName string    `json:"first_name"`
	LastName  string    `json:"last_name"`
	Active    bool      `json:"active"`
	Superuser bool      `json:"superuser"`
	CreatedAt time.Time `json:"created_at"`
}
