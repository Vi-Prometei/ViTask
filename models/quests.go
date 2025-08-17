package models

import (
	"gorm.io/datatypes"
)

type Question struct {
	ID            uint           `gorm:"primaryKey;autoIncrement" json:"id"`
	StoreID       uint           `gorm:"index;not null" json:"store_id"`
	Question      string         `gorm:"type:text;not null" json:"question"`
	ImageURL      string         `gorm:"type:text" json:"image_url"`
	Options       datatypes.JSON `gorm:"type:jsonb;not null" json:"options"`
	CorrectAnswer int            `gorm:"not null" json:"correct_answer"`
	Votes         []Vote         `gorm:"foreignKey:QuestionID" json:"votes"`
}

type Vote struct {
	ID         uint `gorm:"primaryKey;autoIncrement"`
	QuestionID uint `gorm:"index;not null"`
	StoreID    uint `gorm:"not null"`
	UserID     uint `gorm:"not null"`
	Vote       bool `gorm:"not null"`
}
